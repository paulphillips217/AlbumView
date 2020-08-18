const axios = require('axios');
const spotifyTokens = require('./spotifyTokens');
const isJson = require('./utilities');

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
  try {
    console.log('talkToSpotify req.user', req.user);
    const credentials = await spotifyTokens.getSpotifyCredentials(req.user.userId);

    if (!credentials || !credentials.access_token) {
      console.log(
        'talkToSpotify - failed to get credentials, removing invalid cookie'
      );
      res.cookie('jwt', '', { maxAge: 0 });
      res.cookie('spotify', '', { maxAge: 0 });
      res.json({ empty: true });
      return;
    }

    const accessToken = credentials.access_token;
    console.log('talkToSpotify token: ', accessToken);
    const url = getSpotifyUrl(req);
    console.log('talkToSpotify: ', req.path, url, req.method);

    axios({
      url: url,
      method: req.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        console.log('axios got response for ', url);
        //if (response && response.data && isJson(response.data)) {
        if (response && response.data) {
          res.json(response.data);
        } else {
          console.log('axios got empty response');
          /*
          if (typeof response === 'undefined') {
            console.log('axios response is undefined');
          } else {
            console.log('axios response object: ', response);
          }
           */
          res.json({ emptyResponse: true });
        }
      })
      .catch((err) => {
        console.error('caught error in talkToSpotify: ', JSON.stringify(err));
        res.json({ empty: true });
      });
  } catch (err) {
    console.error('talkToSpotify error getting credentials', err);
  }
};

const initiateSavedAlbums = async (req, res) => {
  // get the first page of saved albums from Spotify

  // kick off worker to get the rest of the saved albums

  //

};

const getSavedAlbums = async (req, res) => {
}

const aggregateSpotifyArtistData = async (req, res) => {
  const credentials = await spotifyTokens.getSpotifyCredentials(req.user.userId);
  const accessToken = credentials.access_token;

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
      console.log('axios got response for ', url);
      //    console.log(
      //      'aggregateSpotifyArtistData raw: ',
      //      JSON.stringify(response.data)
      //    );
      if (response && response.data && isJson(response.data)) {
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
      response = await axios({
        url: url,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('axios got response for ', url);
      //console.log(
      //  'aggregateSpotifyArtistData 2 raw: ',
      //  JSON.stringify(response.data)
      //);
      if (response && response.data && isJson(response.data)) {
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
      response = await axios({
        url: url,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('axios got response for ', url);
      //console.log(
      //  'aggregateSpotifyArtistData 2 raw: ',
      //  JSON.stringify(response.data)
      //);
      if (response && response.data && isJson(response.data)) {
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
};
