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

const oneDriveTokens = require('./oneDriveTokens');
const user = require('./data/user');

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

/* AlbumView authentication setup starts here */
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
/* AlbumView authentication setup ends here */

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
    oneDriveTokens.signInComplete
  )
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

/* this is the end of the OneDrive setup */

/* start bull & redis queue setup */
const Queue = require('bull');

// create / connect to a named work queue
const albumViewQueue = new Queue('albumView', process.env.REDIS_URL);

app.get('/queue-count', async (req, res) => {
  console.log('showing queue count');
  const queueCount = await albumViewQueue.count();
  res.json({ queueCount });
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

// test endpoint to get the environment settings
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
