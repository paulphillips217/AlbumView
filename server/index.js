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
const albumViewRoutes = require('./routes/album-view');

const user = require('./data/user');
const moment = require('moment');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

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
        console.log('getting JWT from request - url', req.url);
        // console.log('getting JWT from request - cookies', req.cookies);
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

// In-memory storage of logged-in users (TODO: move to database)
// var users = {};

// Passport calls serializeUser and deserializeUser to manage users
passport.serializeUser((user, done) => {
  // console.log('serializeUser oid: ', user.profile.oid);
  console.log('serializeUser userId: ', user.userId);
  // Use the OID property of the user as a key
  // users[user.profile.oid] = user;
  // done(null, user.profile.oid);
  done(null, user.userId);
});

passport.deserializeUser(async (userId, done) => {
  // console.log('deserializeUser oid:', id);
  console.log('deserializeUser userId:', userId);
  // done(null, users[id] ? users[id] : null);
  const oneDriveCredentials = await user.getOneDriveCredentials(userId);
  console.log(`deserializeUser credentials ${oneDriveCredentials ? 'success' : 'failed'}`);
  done(null, {...oneDriveCredentials, userId});
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
  req,
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

  let userId = 0;

  await passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      console.log('passport auth inside signInComplete has error');
      return;
    }
    if (user) {
      console.log('passport auth inside signInComplete has user', user.userId);
      userId = user.userId;
    }
  })(req);

  console.log('after passport auth inside signInComplete', userId);

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  console.log('signInComplete accessToken expires: ', oauthToken.token.expires_in);
  const credentials = {
    oneDriveProfileId: profile.oid,
    oneDriveParams: JSON.stringify(params),
    oneDriveExpiration: moment()
      .add(oauthToken.token.expires_in, 'seconds')
      .format(),
  };
  // console.log('signInComplete credentials: ', credentials);

  // Save the profile and tokens in user storage
  if (userId) {
    await user.updateTokens(userId, credentials);
    // console.log('signInComplete updated existing database user: ', response);
  }
  else {
    userId = await user.initializeOneDriveUser(credentials);
    console.log('signInComplete initialized new database user: ', userId);
  }

  return done(null, {...credentials, userId});
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
      passReqToCallback: true,
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
const Queue = require('bull');

// create / connect to a named work queue
const testQueue = new Queue('test', process.env.REDIS_URL);

// Kick off a new job by adding it to the work queue
app.get('/job', async (req, res) => {
  console.log('kicking off a new job');
  // This would be where you could pass arguments to the job
  // Ex: workQueue.add({ url: 'https://www.heroku.com' })
  // Docs: https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
  const job = await testQueue.add({myData: "this is test data"});
  console.log('this is after the await for the add');
  res.json({ id: job.id });
});

// Allows the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  const id = req.params.id;
  const job = await testQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    const state = await job.getState();
    const progress = job._progress;
    const reason = job.failedReason;
    res.json({ id, state, progress, reason });
  }
});

// You can listen to global events to get notified when jobs are processed
testQueue.on('global:completed', (jobId, result) => {
  console.log(`Global testQueue Listener: Job completed with result ${result}`);
});

/* end bull & redis queue setup */

app.use('/spotify', spotifyRoutes);
app.use('/one-drive', oneDriveRoutes);
app.use('/last-fm', lastFmRoutes);
app.use('/album-view', albumViewRoutes);

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
  const db = require('./data/db.js');
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
