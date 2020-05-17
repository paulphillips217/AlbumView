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

app.get('/history', spotifyData.talkToSpotify);
app.get('/playlist-list/:offset/:limit', spotifyData.talkToSpotify);
app.get('/playlist-tracks/:id/:offset/:limit', spotifyData.talkToSpotify);
app.get('/playlist-data/:id', spotifyData.talkToSpotify);
app.get('/albums/:id', spotifyData.talkToSpotify);
app.get('/tracks/contains/:ids', spotifyData.talkToSpotify);
app.put('/save-tracks/:ids', spotifyData.talkToSpotify);
app.delete('/delete-tracks/:ids', spotifyData.talkToSpotify);
app.post('/queue-track/:uri', spotifyData.talkToSpotify);

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
