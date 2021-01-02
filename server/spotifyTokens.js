const fetch = require('node-fetch');
const moment = require('moment');
const albumViewTokens = require('./albumViewTokens');
const spotify = require('./credentials');
const user = require('./data/user');

const getSpotifyAccessToken = (req, res, next) => {
  const { code } = req.query;

  if (code) {
    const url = 'https://accounts.spotify.com/api/token';

    const data = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotify.redirect_uri,
      client_id: spotify.client_id,
      client_secret: spotify.client_secret,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    const searchParams = new URLSearchParams();

    Object.keys(data).forEach((prop) => {
      searchParams.set(prop, data[prop]);
    });

    console.log('getSpotifyAccessToken - posting access token to spotify');
    let responseTime = null;
    fetch(url, {
      method: 'POST',
      headers,
      body: searchParams,
    })
      .then((res) => {
        responseTime = moment();
        console.log('access token received at ', responseTime.format());
        return res.json();
      })
      .then((credentials) => {
        console.log('getSpotifyAccessToken adding credentials to request');
        req.credentials = {
          spotifyAuthToken: credentials.access_token,
          spotifyRefreshToken: credentials.refresh_token,
          spotifyExpiration: responseTime
            .add(credentials.expires_in, 'seconds')
            .format(),
        };
        next();
      })
      .catch(next);
  }
};

const getSpotifyCredentials = async (userId) => {
  const credentials = await user.getSpotifyCredentials(userId);
  if (!credentials) {
    console.log('getSpotifyCredentials - user not found in database');
    return {};
  }

  const {
    spotifyAuthToken,
    spotifyRefreshToken,
    spotifyExpiration,
  } = credentials;
  //console.log('getCredentialsFromHeader from database', {
  //  spotifyAuthToken,
  //  spotifyRefreshToken,
  //  spotifyExpiration,
  //});

  const tokenExpiration = moment(spotifyExpiration);
  const currentTime = moment();
  if (tokenExpiration <= currentTime && spotifyRefreshToken) {
    console.log('getSpotifyCredentials refreshing credentials');
    // console.log('getSpotifyCredentials token before refresh: ', spotifyAuthToken);
    return await refreshSpotifyAccessToken(userId, spotifyRefreshToken);
  }

  console.log('getSpotifyCredentials using existing credentials');
  return {
    spotifyAuthToken,
    spotifyRefreshToken,
    spotifyExpiration,
  };
};

const refreshSpotifyAccessToken = async (userId, spotifyRefreshToken) => {
  if (!spotifyRefreshToken) {
    console.log('refreshSpotifyAccessToken: refresh token is empty');
    return {};
  }

  const url = 'https://accounts.spotify.com/api/token';
  const data = {
    grant_type: 'refresh_token',
    refresh_token: spotifyRefreshToken,
    client_id: spotify.client_id,
    client_secret: spotify.client_secret,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const searchParams = new URLSearchParams();

  Object.keys(data).forEach((prop) => {
    searchParams.set(prop, data[prop]);
  });

  console.log('refreshSpotifyAccessToken posting refresh token to spotify');
  let responseTime = null;
  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: searchParams,
    });
    responseTime = moment();
    const credentials = await fetchResponse.json();
    const newCredentials = {
      spotifyAuthToken: credentials.access_token,
      spotifyExpiration: responseTime
        .add(credentials.expires_in, 'seconds')
        .format(),
      spotifyRefreshToken: spotifyRefreshToken,
    };
    console.log('refreshSpotifyAccessToken got credentials');

    // add the new tokens to the database
    await user.updateTokens(userId, newCredentials);
    return newCredentials;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const authorizeSpotify = (req, res) => {
  console.log('authorizeSpotify - login url process');
  const scopes =
    'user-read-recently-played playlist-read-private playlist-read-collaborative user-modify-playback-state user-library-modify user-library-read user-follow-read user-read-playback-state user-modify-playback-state';

  const url = `https://accounts.spotify.com/authorize?&client_id=${
    spotify.client_id
  }&redirect_uri=${encodeURI(
    spotify.redirect_uri
  )}&response_type=code&scope=${scopes}`;

  res.redirect(url);
};

const handleSpotifyAuthentication = async (req, res) => {
  console.log('handleSpotifyAuthentication entry point -- ', req.url);
  if (await albumViewTokens.setSessionJwt(req, res)) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    res.json({ error: true });
  }
}

module.exports = {
  getSpotifyAccessToken,
  getSpotifyCredentials,
  authorizeSpotify,
  handleSpotifyAuthentication,
};
