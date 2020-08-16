const fetch = require('node-fetch');
const moment = require('moment');
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

    console.log('posting access token to spotify');
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
        credentials.token_expiration = responseTime
          .add(credentials.expires_in, 'seconds')
          .format();
        req.credentials = credentials;
        next();
      })
      .catch(next);
  }
};

const getSpotifyCredentials = async (req) => {
  const credentials = await user.getCredentials(req.user.userId);
  if (!credentials) {
    console.log('getSpotifyCredentials - user not found in database');
    return {};
  }

  const {
    spotifyAuthToken,
    spotifyRefreshToken,
    spotifyExpiration,
  } = credentials;
  console.log('getCredentialsFromHeader from database', {
    spotifyAuthToken,
    spotifyRefreshToken,
    spotifyExpiration,
  });

  const tokenExpiration = moment(spotifyExpiration);
  const currentTime = moment();
  if (tokenExpiration <= currentTime && spotifyRefreshToken) {
    console.log('getCredentialsFromHeader refreshing credentials');
    console.log(
      'getCredentialsFromHeader token before refresh: ',
      spotifyAuthToken
    );
    return await refreshSpotifyAccessToken(
      req.user.userId,
      spotifyRefreshToken
    );
  }

  console.log('getCredentialsFromHeader using existing credentials');
  return {
    access_token: spotifyAuthToken,
    refresh_token: spotifyRefreshToken,
    token_expiration: spotifyExpiration,
  };
};

const refreshSpotifyAccessToken = async (userId, refresh_token) => {
  if (!refresh_token) {
    console.log('refreshSpotifyAccessToken: refresh token is empty');
    return {};
  }

  const url = 'https://accounts.spotify.com/api/token';
  const data = {
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
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

  console.log('posting refresh token to spotify');
  let responseTime = null;
  try {
    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: searchParams,
    });
    responseTime = moment();
    const credentials = await fetchResponse.json();
    credentials.token_expiration = responseTime
      .add(credentials.expires_in, 'seconds')
      .format();
    credentials.refresh_token = refresh_token;
    console.log('refreshSpotifyAccessToken got credentials');

    // add the new tokens to the database
    await user.updateSpotifyTokens(userId, {
      spotifyAuthToken: credentials.access_token,
      spotifyRefreshToken: credentials.refresh_token,
      spotifyExpiration: credentials.token_expiration,
    });

    return credentials;

  } catch (err) {
    console.error(err);
    return {};
  }
};

module.exports = {
  getSpotifyAccessToken,
  getSpotifyCredentials,
};
