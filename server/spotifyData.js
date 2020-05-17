//const fetch = require('node-fetch');
const axios = require('axios');
const spotifyTokens = require('./accessToken');
const isJson = require('./utilities');

const getSpotifyUrl = (req) => {
  console.log('getSpotifyUrl:', req.path);
  switch (true) {
    case /\/history/.test(req.path):
      // track play history
      return 'https://api.spotify.com/v1/me/player/recently-played?limit=10';
    case /\/playlist-tracks*/.test(req.path):
      // list tracks for a playlist
      return `https://api.spotify.com/v1/playlists/${req.params.id}/tracks?offset=${req.params.offset}&limit=${req.params.limit}`;
    case /\/playlist-lists*/.test(req.path):
      // list of playlists
      return `https://api.spotify.com/v1/me/playlists?offset=${req.params.offset}&limit=${req.params.limit}`;
    case /\/playlist-data*/.test(req.path):
      // information for a single playlist
      return `https://api.spotify.com/v1/playlists/${req.params.id}`;
    case /\/albums*/.test(req.path):
      // information for a single album
      return `https://api.spotify.com/v1/albums/${req.params.id}`;
    case /\/tracks\/contains*/.test(req.path):
      // check whether the comma-separated list of track ids are contained in my favorites
      return `https://api.spotify.com/v1/me/tracks/contains?ids=${req.params.ids}`;
    case /\/save-tracks*/.test(req.path):
    case /\/delete-tracks*/.test(req.path):
      // save or delete a favorite track
      return `https://api.spotify.com/v1/me/tracks?ids=${req.params.ids}`;
    case /\/queue-track*/.test(req.path):
      // queue a track to the player
      return `https://api.spotify.com/v1/me/player/queue?uri=${req.params.uri}`;
    default:
      console.log(`unrecognized url in getSpotifyUrl: ${req.path}.`);
      return '';
  }
};

const talkToSpotify = (req, res) => {
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
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
      if (response.data) {
        //console.log(`Got ${JSON.stringify(response.data)} from axios`);
        res.json(isJson(response.data) ? response.data : {});
      }
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });

  /*
  return fetch(url, {
    method: req.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .then((data) => {
      res.json(isJson(data) ? data : {});
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
   */
};

module.exports = {
  talkToSpotify,
};
