//const fetch = require('node-fetch');
const axios = require('axios');
const spotifyTokens = require('./accessToken');
const isJson = require('./utilities');

const getSpotifyUrl = (req) => {
  //console.log('getSpotifyUrl:', req.path);
  switch (true) {
    case /\/history/.test(req.path):
      // track play history
      return 'https://api.spotify.com/v1/me/player/recently-played?limit=10';
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
  const credentials = await spotifyTokens.getCredentialsFromHeader(req);
  const accessToken = credentials.access_token;
  console.log('talkToSpotify token: ', accessToken);
  const url = getSpotifyUrl(req);
  console.log('talkToSpotify: ', req.path, url, req.method);

  res.set({
    'Access-Control-Expose-Headers':
      'x-spotify-access-token, x-spotify-refresh-token, x-spotify-token-expiration',
    'x-spotify-access-token': credentials.access_token,
    'x-spotify-refresh-token': credentials.refresh_token,
    'x-spotify-token-expiration': credentials.token_expiration,
  });

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
};

const aggregateSpotifyArtistData = async (req, res) => {
  const credentials = await spotifyTokens.getCredentialsFromHeader(req);
  const accessToken = credentials.access_token;
  let url = `https://api.spotify.com/v1/me/following?type=artist&after=${req.params.offset}&limit=${req.params.limit}`;
  console.log(
    'aggregateSpotifyArtistData first url',
    req.path,
    url,
    req.method
  );
  let artistList = [];

  res.set({
    'Access-Control-Expose-Headers':
      'x-spotify-access-token, x-spotify-refresh-token, x-spotify-token-expiration',
    'x-spotify-access-token': credentials.access_token,
    'x-spotify-refresh-token': credentials.refresh_token,
    'x-spotify-token-expiration': credentials.token_expiration,
  });

  // first we get the artists you're following

  try {
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
      response.data.artists.items.map((item) => {
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

    // second is the list of favorite albums

    url = `https://api.spotify.com/v1/me/albums?offset=${req.params.offset}&limit=${req.params.limit}`;
    console.log(
      'aggregateSpotifyArtistData second url',
      req.path,
      url,
      req.method
    );
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
      response.data.items.map((item) => {
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

    // third is the list of favorite tracks

    url = `https://api.spotify.com/v1/me/tracks?offset=${req.params.offset}&limit=${req.params.limit}`;
    console.log(
      'aggregateSpotifyArtistData third url',
      req.path,
      url,
      req.method
    );
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
      response.data.items.map((item) => {
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

    res.json(artistList);
  } catch (err) {
    console.error(JSON.stringify(err));
    res.json({ empty: true });
  }
};

module.exports = {
  talkToSpotify,
  aggregateSpotifyArtistData,
};
