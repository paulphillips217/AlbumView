if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //  console.log(result.parsed);
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const authorizeSpotify = require('./authorizeSpotify');
const spotifyTokens = require('./accessToken');
const spotifyData = require('./spotifyData');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !isDev,
});

// Priority serve any static files.
if (isDev) {
  app.use(express.static(path.resolve(__dirname, '../client/public')));
} else {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

// test endpoint to see if the server is running
app.get('/ping', (req, res) => {
  res.send('It is ALIVE!!!');
});

// test endpoint to get the environment setting
app.get('/node-env', (req, res) => {
  res.send(`NODE_ENV: ${process.env.NODE_ENV}<br/>
            PORT: ${process.env.PORT}<br/>
            CLIENT_URL: ${process.env.CLIENT_URL}<br/>
            `);
});

app.get('/db-test', async (req, res) => {
  try {
    pool.query('SELECT * FROM credentials', (error, results) => {
      if (error) {
        throw error;
      }
      res.send('cred: ' + results.rows[0].credential);
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

app.get('/login', authorizeSpotify);

app.get('/callback', spotifyTokens.getSpotifyAccessToken, (req, res, next) => {
//  console.log('callback - credentials: ' + JSON.stringify(req.credentials));
  try {
//    console.log('access token: ' + req.credentials.access_token);
//    console.log('refresh token: ' + req.credentials.refresh_token);
    //    spotifyTokens.storeAccessTokenInDatabase(pool, req.credentials);
    const clientUrl = process.env.CLIENT_URL;
    res.redirect(
      `${clientUrl}/?access_token=${req.credentials.access_token}&refresh_token=${req.credentials.refresh_token}`
    );
  } catch (err) {
    console.error(err);
  }
});

app.get('/history', (req, res) => {
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  const url = 'https://api.spotify.com/v1/me/player/recently-played?limit=10';
  spotifyData
    .getSpotifyData(accessToken, url)
    .then((data) => {
      const arr = data.items.map((e) => ({
        played_at: e.played_at,
        track_name: e.track.name,
      }));
      res.json(arr);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

app.get('/playlists/:offset/:limit', (req, res) => {
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  const url = `https://api.spotify.com/v1/me/playlists?offset=${req.params.offset}&limit=${req.params.limit}`;
  spotifyData
    .getSpotifyData(accessToken, url)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

app.get('/playlist/:id', (req, res) => {
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  const url = `https://api.spotify.com/v1/playlists/${req.params.id}`;
  spotifyData
    .getSpotifyData(accessToken, url)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

app.get('/playlist-tracks/:id/:offset/:limit', (req, res) => {
  console.log('playlist tracks: ' + req.params.id);
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  const url = `https://api.spotify.com/v1/playlists/${req.params.id}/tracks?offset=${req.params.offset}&limit=${req.params.limit}`;
  spotifyData
    .getSpotifyData(accessToken, url)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

app.get('/albums/:id', (req, res) => {
  console.log('album: ' + req.params.id);
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  const url = `https://api.spotify.com/v1/albums/${req.params.id}`;
  spotifyData
    .getSpotifyData(accessToken, url)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

app.post('/queue-track/:uri', (req, res) => {
  const accessToken = spotifyTokens.getAccessTokenFromHeader(req);
  console.log('queue track uri: ' + req.params.uri);
  const url = `https://api.spotify.com/v1/me/player/queue?uri=${req.params.uri}`;
  spotifyData
    .postSpotifyData(accessToken, url)
    .then((data) => {
      console.log('queue track data: ' + data);
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      console.log('attempting to refresh spotify token');
      const refreshToken = spotifyTokens.getRefreshTokenFromHeader(req);
      spotifyTokens.refreshSpotifyAccessToken(req, res, refreshToken);
    });
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  if (isDev) {
    response.sendFile(
      path.resolve(__dirname, '../client/public', 'index.html')
    );
  } else {
    response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  }
});

app.listen(PORT, function () {
  console.log(`Node server listening on port ${PORT}`);
});
