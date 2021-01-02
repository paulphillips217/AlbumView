const axios = require('axios');
const moment = require('moment');
const spotifyTokens = require('./spotifyTokens');
const utilities = require('./utilities');
const artist = require('./data/artist');
const album = require('./data/album');
const user = require('./data/user');

const Queue = require('bull');
const savedAlbumQueue = new Queue('savedAlbums', process.env.REDIS_URL);
let lastAlbumQueue = new Queue('lastAlbums', process.env.REDIS_URL);

const getSpotifyUrl = (req) => {
  //console.log('getSpotifyUrl:', req.path);
  switch (true) {
    case /\/history/.test(req.path):
      // track play history
      return 'https://api.spotify.com/v1/me/player/recently-played?limit=10';
    case /\/search/.test(req.path):
      // track play history
      return `https://api.spotify.com/v1/search?q=${req.params.query}&type=${req.params.type}`;
    case /\/playlist-tracks*/.test(req.path):
      // list tracks for a playlist
      return `https://api.spotify.com/v1/playlists/${req.params.id}/tracks?offset=${req.params.offset}&limit=${req.params.limit}&market=US`;
    case /\/playlist-lists*/.test(req.path):
      // list of playlists
      return `https://api.spotify.com/v1/me/playlists?offset=${req.params.offset}&limit=${req.params.limit}`;
    case /\/playlist-data*/.test(req.path):
      // information for a single playlist
      return `https://api.spotify.com/v1/playlists/${req.params.id}`;
    case /\/album-list*/.test(req.path):
      // list of saved albums
      return `https://api.spotify.com/v1/me/albums?offset=${req.params.offset}&limit=${req.params.limit}`;
    case /\/track-list*/.test(req.path):
      // list of saved tracks
      return `https://api.spotify.com/v1/me/tracks?offset=${req.params.offset}&limit=${req.params.limit}&market=US`;
    case /\/album-data*/.test(req.path):
      // information for a single album
      return `https://api.spotify.com/v1/albums/${req.params.id}?market=US`;
    case /\/tracks\/contains*/.test(req.path):
      // check whether the comma-separated list of track ids are contained in my favorites
      return `https://api.spotify.com/v1/me/tracks/contains?ids=${req.params.ids}`;
    case /\/albums\/contains*/.test(req.path):
      // check whether the comma-separated list of track ids are contained in my favorites
      return `https://api.spotify.com/v1/me/albums/contains?ids=${req.params.ids}`;
    case /\/artist-data*/.test(req.path):
      // information for a single artist
      return `https://api.spotify.com/v1/artists/${req.params.id}`;
    case /\/artist-list*/.test(req.path):
      // list of saved artists
      return `https://api.spotify.com/v1/me/following?type=artist&after=${req.params.offset}&limit=${req.params.limit}`;
    case /\/artist-albums*/.test(req.path):
      // list of artist's albums
      return `https://api.spotify.com/v1/artists/${req.params.id}/albums?offset=${req.params.offset}&limit=${req.params.limit}`;
    case /\/related-artists*/.test(req.path):
      // list of related artists
      return `https://api.spotify.com/v1/artists/${req.params.id}/related-artists`;
    case /\/player-status*/.test(req.path):
      // get player context
      return `https://api.spotify.com/v1/me/player`;
    case /\/player-pause*/.test(req.path):
      // pause player
      return `https://api.spotify.com/v1/me/player/pause`;
    case /\/player-shuffle*/.test(req.path):
      // set shuffle status
      return `https://api.spotify.com/v1/me/player/shuffle?state=${req.params.state}`;
    case /\/player-next*/.test(req.path):
      // skip player to next track
      return `https://api.spotify.com/v1/me/player/next`;
    case /\/save-tracks*/.test(req.path):
    case /\/delete-tracks*/.test(req.path):
      // save or delete a favorite track
      return `https://api.spotify.com/v1/me/tracks?ids=${req.params.ids}`;
    case /\/save-albums*/.test(req.path):
    case /\/delete-albums*/.test(req.path):
      // save or delete a favorite albums
      return `https://api.spotify.com/v1/me/albums?ids=${req.params.ids}`;
    case /\/queue-track*/.test(req.path):
      // queue a track to the player
      return `https://api.spotify.com/v1/me/player/queue?uri=${req.params.uri}`;
    default:
      console.log(`unrecognized url in getSpotifyUrl: ${req.path}.`);
      return '';
  }
};

const talkToSpotify = async (req, res) => {
  let accessToken;
  const method = req.method;
  const url = getSpotifyUrl(req);
  console.log('talkToSpotify: ', req.path, url, method);

  try {
    console.log('talkToSpotify req.user', req.user);
    const credentials = await spotifyTokens.getSpotifyCredentials(
      req.user.userId
    );

    if (!credentials || !credentials.spotifyAuthToken) {
      console.log(
        'talkToSpotify - failed to get credentials, removing invalid cookie'
      );
      res.cookie('jwt', '', { maxAge: 0 });
      res.cookie('spotify', '', { maxAge: 0 });
      res.json({ empty: true });
      return;
    }

    accessToken = credentials.spotifyAuthToken;
    console.log('talkToSpotify token: ', accessToken);
  } catch (err) {
    console.error('talkToSpotify error getting credentials', err);
    res.json({ empty: true });
  }

  const response = await chatWithSpotify(accessToken, url, method);
  res.json(response);
};

const chatWithSpotify = async (accessToken, url, method) => {
  try {
    const response = await axios({
      url: url,
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // console.log('axios got response for ', url);
    if (response && response.data) {
      return response.data;
    } else {
      console.log('axios got empty response');
      return { emptyResponse: true };
    }
  } catch (err) {
    console.error('chatWithSpotify error', err);
    return { emptyResponse: true };
  }
};

// this gets them from the database and sends them to the client
const fetchSavedAlbums = async (req, res) => {
  const userAlbums = await user.getUserAlbums(
    req.user.userId,
    req.params.genreId
  );
  console.log(
    'fetchSavedAlbums - genre & count:',
    req.params.genreId,
    userAlbums.length
  );

  // return album data to client
  res.json(userAlbums);
};

// this gets them from Spotify
const refreshSavedAlbums = async (req, res) => {
  // get the first page of saved albums from Spotify
  const totalCount = await getSavedAlbums(req.user.userId, 0);
  console.log('refreshSavedAlbums total count is ', totalCount);

  // kick off worker to get the rest of the saved albums
  const job = await savedAlbumQueue.add({
    userId: req.user.userId,
    count: totalCount,
  });
  console.log('refreshSavedAlbums created savedAlbumQueue worker job', job.id);

  // return album count to client
  res.json({ count: totalCount, jobId: job.id });
};

const getSavedAlbums = async (userId, offset) => {
  const credentials = await spotifyTokens.getSpotifyCredentials(userId);
  if (!credentials || !credentials.spotifyAuthToken) {
    return 0;
  }
  const url = `https://api.spotify.com/v1/me/albums?offset=${offset}&limit=${process.env.SPOTIFY_PAGE_LIMIT}`;
  console.log('getSavedAlbums url', url);
  const response = await chatWithSpotify(credentials.spotifyAuthToken, url, 'GET');
  //console.log('getSavedAlbums response album[0]', response.items);
  if (!response || response.length === 0 || !response.items) {
    console.error('getSavedAlbums response is invalid: ', response);
    return 0;
  }

  // add artists to database
  const albums = [];
  // we need to do the inserts in an array with await so we don't duplicate
  for (let i = 0; i < response.items.length; i += 1) {
    const theArtist = response.items[i].album.artists[0];
    const theAlbum = response.items[i].album;
    const artistId = await artist.insertSingleArtist({
      spotifyId: theArtist.id,
      name: theArtist.name,
    });
    // console.log('insertSingleArtist in getSavedAlbums returned ', artistId);
    albums.push({
      spotifyId: theAlbum.id,
      name: theAlbum.name,
      artistId: artistId,
      imageUrl: theAlbum.images ? utilities.getImage(theAlbum.images) : '',
      releaseDate: moment(theAlbum.release_date),
    });
  }
  // console.log('albums: ', albums);

  // add albums to database
  for (let i = 0; i < albums.length; i += 1) {
    const albumId = await album.insertSingleAlbum(albums[i]);
    // console.log('insertSingleAlbum in getSavedAlbums returned ', albumId);

    // associate album with user
    const result = await user.insertSingleUserAlbum({
      userId,
      albumId: albumId,
    });
    // console.log('insertSingleUserAlbum returned: ', result);
  }

  return response.total;
};

const aggregateSpotifyArtistData = async (req, res) => {
  const credentials = await spotifyTokens.getSpotifyCredentials(
    req.user.userId
  );
  const accessToken = credentials.spotifyAuthToken;

  let url = '';
  let artistList = [];
  const offset = +req.params.offset;
  const limit = +req.params.limit;
  let artistTotal = +req.params.artists;
  let albumTotal = +req.params.albums;
  let trackTotal = +req.params.tracks;

  try {
    // first we get the artists you're following
    // if we don't know what the total is it will be set to -1
    if (artistTotal < 0 || offset < artistTotal) {
      url = `https://api.spotify.com/v1/me/following?type=artist&after=${offset}&limit=${limit}`;
      console.log('aggregate first url', req.path, url, req.method);
      let response = await axios({
        url: url,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log('axios got response for ', url);
      //    console.log(
      //      'aggregateSpotifyArtistData raw: ',
      //      JSON.stringify(response.data)
      //    );
      if (response && response.data && utilities.isJson(response.data)) {
        artistTotal = +response.data.artists.total;
        response.data.artists.items.forEach((item) => {
          artistList.push({
            id: item.id,
            name: item.name,
            images: item.images,
          });
        });
      }
      //console.log(
      //  'aggregateSpotifyArtistData artistList: ',
      //  JSON.stringify(artistList)
      //);
    }

    // second is the list of favorite albums
    // if we don't know what the total is it will be set to -1
    if (albumTotal < 0 || offset < albumTotal) {
      url = `https://api.spotify.com/v1/me/albums?offset=${offset}&limit=${limit}`;
      console.log('aggregate second url', req.path, url, req.method);
      const response = await axios({
        url: url,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log('axios got response for ', url);
      //console.log(
      //  'aggregateSpotifyArtistData 2 raw: ',
      //  JSON.stringify(response.data)
      //);
      if (response && response.data && utilities.isJson(response.data)) {
        albumTotal = +response.data.total;
        response.data.items.forEach((item) => {
          if (!artistList.some((a) => a.id === item.album.artists[0].id)) {
            artistList.push({
              id: item.album.artists[0].id,
              name: item.album.artists[0].name,
              images: '',
            });
          }
        });
      }
      //console.log(
      //  'aggregateSpotifyArtistData artistList: ',
      //  JSON.stringify(artistList)
      //);
    }

    // third is the list of favorite tracks
    // if we don't know what the total is it will be set to -1
    if (trackTotal < 0 || offset < trackTotal) {
      url = `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`;
      console.log('aggregate third url', req.path, url, req.method);
      const response = await axios({
        url: url,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log('axios got response for ', url);
      //console.log(
      //  'aggregateSpotifyArtistData 2 raw: ',
      //  JSON.stringify(response.data)
      //);
      if (response && response.data && utilities.isJson(response.data)) {
        trackTotal = +response.data.total;
        response.data.items.forEach((item) => {
          if (!artistList.some((a) => a.id === item.track.artists[0].id)) {
            artistList.push({
              id: item.track.artists[0].id,
              name: item.track.artists[0].name,
              images: '',
            });
          }
        });
      }
      //console.log(
      //  'aggregateSpotifyArtistData artistList: ',
      //  JSON.stringify(artistList)
      //);
    }

    res.json({
      artistTotal,
      albumTotal,
      trackTotal,
      offset,
      data: artistList,
    });
  } catch (err) {
    console.error(JSON.stringify(err));
    res.json({ empty: true });
  }
};

module.exports = {
  talkToSpotify,
  aggregateSpotifyArtistData,
  refreshSavedAlbums,
  getSavedAlbums,
  fetchSavedAlbums,
};
