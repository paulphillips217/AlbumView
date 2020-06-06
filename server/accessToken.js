const fetch = require('node-fetch');
const moment = require('moment');
const spotify = require('./credentials');

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

const storeAccessTokenInDatabase = (pool, token) => {
  try {
    pool.query(
      'UPDATE credentials SET credential = $1 WHERE id = 1',
      [token],
      (error, results) => {
        if (error) {
          console.error(error);
          throw error;
        }
        console.log(`storeAccessToken result: ${results}`);
      }
    );
  } catch (err) {
    console.error(err);
  }
};

const getAccessTokenFromDatabase = (pool, callback) => {
  try {
    pool.query('SELECT * FROM credentials WHERE id = 1', (error, results) => {
      if (error) {
        console.error(error);
        throw error;
      }
      const credential = results.rows[0].credential;
      const accessToken = JSON.parse(credential).access_token;
      callback(accessToken);
    });
  } catch (err) {
    console.error(err);
  }
};

const getCredentialsFromHeader = async (req) => {
  const tokenExpirationRaw = getTokenExpirationFromHeader(req);
  const refreshToken = getRefreshTokenFromHeader(req);
  const tokenExpiration = moment(tokenExpirationRaw);
  const currentTime = moment();
  if (tokenExpiration <= currentTime && refreshToken) {
    console.log('getCredentialsFromHeader refreshing credentials');
    console.log('getCredentialsFromHeader token before refresh: ', getAccessTokenFromHeader(req));
    return await refreshSpotifyAccessToken(refreshToken);
  }
  console.log('getCredentialsFromHeader using existing credentials');
  return {
    access_token: getAccessTokenFromHeader(req),
    refresh_token: getRefreshTokenFromHeader(req),
    token_expiration: getTokenExpirationFromHeader(req),
  };
};

const getAccessTokenFromHeader = (req) => {
  return req.header('x-spotify-access-token');
};

const getRefreshTokenFromHeader = (req) => {
  return req.header('x-spotify-refresh-token');
};

const getTokenExpirationFromHeader = (req) => {
  return req.header('x-spotify-token-expiration');
};

const refreshSpotifyAccessToken = async (refresh_token) => {
  if (!refresh_token) {
    console.log(
      'refreshSpotifyAccessToken: refresh token is empty, logging out'
    );
    return {
      access_token: '',
      refresh_token: '',
      token_expiration: moment().format(),
    };
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
    return credentials;
  } catch (err) {
    console.error(err);
    return {
      access_token: '',
      refresh_token: '',
      token_expiration: moment().format(),
    };
  }
};

module.exports = {
  getSpotifyAccessToken,
  storeAccessTokenInDatabase,
  getAccessTokenFromDatabase,
  getCredentialsFromHeader,
  getAccessTokenFromHeader,
  getRefreshTokenFromHeader,
  refreshSpotifyAccessToken,
};
