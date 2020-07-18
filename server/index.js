if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log(result.parsed);
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const authorizeSpotify = require('./authorizeSpotify');
const spotifyTokens = require('./accessToken');
const spotifyData = require('./spotifyData');
const lastFmData = require('./lastFmData');
const oneDriveTokens = require('./tokens');

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

/* OneDrive stuff starts here */

const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const authRouter = require('./routes/auth');

// Session middleware
// NOTE: Uses default in-memory session store, which is not
// suitable for production
app.use(session({
  secret: 'my_secret_value_is_secret',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Configure passport

// In-memory storage of logged-in users
// For demo purposes only, production apps should store
// this in a reliable storage
var users = {};

// Passport calls serializeUser and deserializeUser to
// manage users
passport.serializeUser(function(user, done) {
  // Use the OID property of the user as a key
  users[user.profile.oid] = user;
  done (null, user.profile.oid);
});

passport.deserializeUser(function(id, done) {
  done(null, users[id]);
});

// Configure simple-oauth2
const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.OAUTH_APP_ID,
    secret: process.env.OAUTH_APP_PASSWORD
  },
  auth: {
    tokenHost: process.env.OAUTH_AUTHORITY,
    authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
    tokenPath: process.env.OAUTH_TOKEN_ENDPOINT
  }
});

const graph = require('./graph');

// Callback function called once the sign-in is complete
// and an access token has been obtained
async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
  if (!profile.oid) {
    return done(new Error("No OID found in user profile."));
  }

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  // Save the profile and tokens in user storage
  users[profile.oid] = { profile, oauthToken };
  return done(null, users[profile.oid]);
}

// Configure OIDC strategy
passport.use(new OIDCStrategy(
  {
    identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
    clientID: process.env.OAUTH_APP_ID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: process.env.OAUTH_REDIRECT_URI,
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.OAUTH_APP_PASSWORD,
    validateIssuer: false,
    passReqToCallback: false,
    scope: process.env.OAUTH_SCOPES.split(' ')
  },
  signInComplete
));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);

app.get('/one-drive/:id', async (req, res) => {
  try {
    console.log('one drive getter, id is: ', req.params.id);
    const accessToken = oneDriveTokens.getOneDriveAccessToken(req);
    const drives = await graph.getDrives(accessToken, req.params.id);

    if (drives) {
      //console.log('drives: ', JSON.stringify(drives));
      res.json(drives.value);
    }
    else {
      console.log('drives is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
  res.json({ error: err });
  }
});

/* this is the end of the OneDrive stuff */

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
  //console.log('callback - credentials: ' + JSON.stringify(req.credentials));
  try {
    //console.log('access token: ' + req.credentials.access_token);
    //console.log('refresh token: ' + req.credentials.refresh_token);
    console.log('token expiration: ' + req.credentials.token_expiration);
    //spotifyTokens.storeSpotifyAccessTokenInDatabase(pool, req.credentials);
    const clientUrl = process.env.CLIENT_URL;
    res.redirect(
      `${clientUrl}/?spotify_access_token=${req.credentials.access_token}&spotify_refresh_token=${req.credentials.refresh_token}&spotify_token_expiration=${req.credentials.token_expiration}`
    );
  } catch (err) {
    console.error(err);
  }
});

app.get('/last-album', lastFmData.talkToLastFm);
app.get('/history', spotifyData.talkToSpotify);
app.get('/search/:query/:type', spotifyData.talkToSpotify);
app.get('/playlist-list/:offset/:limit', spotifyData.talkToSpotify);
app.get('/playlist-tracks/:id/:offset/:limit', spotifyData.talkToSpotify);
app.get('/playlist-data/:id', spotifyData.talkToSpotify);
app.get('/album-data/:id', spotifyData.talkToSpotify);
app.get('/album-list/:offset/:limit', spotifyData.talkToSpotify);
app.get('/albums/contains/:ids', spotifyData.talkToSpotify);
app.get('/track-list/:offset/:limit', spotifyData.talkToSpotify);
app.get('/tracks/contains/:ids', spotifyData.talkToSpotify);
app.get('/artist-data/:id', spotifyData.talkToSpotify);
app.get('/artist-list/:offset/:limit', spotifyData.aggregateSpotifyArtistData);
app.get('/artist-albums/:id/:offset/:limit', spotifyData.talkToSpotify);
app.get('/related-artists/:id', spotifyData.talkToSpotify);
app.get('/player-status', spotifyData.talkToSpotify);
app.put('/player-pause', spotifyData.talkToSpotify);
app.put('/player-shuffle/:state', spotifyData.talkToSpotify);
app.put('/save-tracks/:ids', spotifyData.talkToSpotify);
app.put('/save-albums/:ids', spotifyData.talkToSpotify);
app.delete('/delete-tracks/:ids', spotifyData.talkToSpotify);
app.delete('/delete-albums/:ids', spotifyData.talkToSpotify);
app.post('/queue-track/:uri', spotifyData.talkToSpotify);
app.post('/player-next', spotifyData.talkToSpotify);

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
