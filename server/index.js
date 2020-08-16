if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log(result.parsed);
}

const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('cookie-session');
const passport = require('passport');

const spotifyRoutes = require('./routes/spotify');
const lastFmRoutes = require('./routes/last-fm');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const db = require('./data/db.js');

// Priority serve any static files.
if (isDev) {
  app.use(express.static(path.resolve(__dirname, '../client/public')));
} else {
  app.use(express.static(path.resolve(__dirname, '../client/build')));
}

/* AlbumView authentication starts here */
const JWTStrategy = require('passport-jwt').Strategy;

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: (req) => {
        console.log('getting JWT from request - cookies', req.cookies);
        return req.cookies ? req.cookies.jwt : '';
      },
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      console.log('JWTStrategy payload', jwtPayload);
      if (!jwtPayload) {
        console.log('empty JWTStrategy payload');
        return done('empty payload');
      }
      if (Date.now() > jwtPayload.expires) {
        console.log('JWTStrategy - jwt expired');
        return done('jwt expired');
      }
      return done(null, jwtPayload);
    }
  )
);

/* AlbumView authentication ends here */

/* OneDrive setup starts here */

const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const oneDriveRoutes = require('./routes/one-drive');

// Session middleware
app.use(
  session({
    secret: 'my_secret_value_is_secret',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
  })
);

// Configure passport

// In-memory storage of logged-in users (TODO: move to database)
var users = {};

// Passport calls serializeUser and deserializeUser to manage users
passport.serializeUser(function (user, done) {
  console.log('serializeUser ', user);
  // Use the OID property of the user as a key
  users[user.profile.oid] = user;
  done(null, user.profile.oid);
});

passport.deserializeUser(function (id, done) {
  console.log('deserializeUser ', id);
  done(null, users[id] ? users[id] : null);
});

// Configure simple-oauth2
const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.OAUTH_APP_ID,
    secret: process.env.OAUTH_APP_PASSWORD,
  },
  auth: {
    tokenHost: process.env.OAUTH_AUTHORITY,
    authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
    tokenPath: process.env.OAUTH_TOKEN_ENDPOINT,
  },
});

// Callback function called once the sign-in is complete
// and an access token has been obtained
async function signInComplete(
  iss,
  sub,
  profile,
  accessToken,
  refreshToken,
  params,
  done
) {
  console.log('signInComplete profile.oid', profile.oid);

  if (!profile.oid) {
    return done(new Error('No OID found in user profile.'));
  }

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  // Save the profile and tokens in user storage
  users[profile.oid] = { profile, oauthToken };
  return done(null, users[profile.oid]);
}

// Configure OIDC strategy
passport.use(
  new OIDCStrategy(
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
      scope: process.env.OAUTH_SCOPES.split(' '),
    },
    signInComplete
  )
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

/* this is the end of the OneDrive setup */

/* start bull & redis queue setup */
let Queue = require('bull');

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create / Connect to a named work queue
let workQueue = new Queue('work', REDIS_URL);

// Kick off a new job by adding it to the work queue
app.get('/job', async (req, res) => {
  console.log('kicking off a new job');
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  let job = await workQueue.add();
  res.json({ id: job.id });
});

// Allows the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  let id = req.params.id;
  let job = await workQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    let state = await job.getState();
    let progress = job._progress;
    let reason = job.failedReason;
    res.json({ id, state, progress, reason });
  }
});

// You can listen to global events to get notified when jobs are processed
workQueue.on('global:completed', (jobId, result) => {
  console.log(`Job completed with result ${result}`);
});

/* end bull & redis queue setup */

app.use('/spotify', spotifyRoutes);
app.use('/one-drive', oneDriveRoutes);
app.use('/last-fm', lastFmRoutes);

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
  const artist = await db('artist').first();
  res.json({ artist });
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
