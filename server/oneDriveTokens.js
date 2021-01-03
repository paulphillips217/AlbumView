const passport = require('passport');
const moment = require('moment');
const albumViewTokens = require('./albumViewTokens');
const user = require('./data/user');

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

const getOneDriveAccessToken = async (userId) => {
  console.log('getOneDriveAccessToken user: ', userId);
  if (userId) {
    // Get the stored token
    const credentials = await user.getOneDriveCredentials(userId);
    const params = JSON.parse(credentials.oneDriveParams);
    // console.log('getOneDriveAccessToken params: ', params);

    // Create a simple-oauth2 token from raw token params
    const oauthToken = oauth2.accessToken.create(params);
    // console.log('getOneDriveAccessToken oauthToken: ', oauthToken);

    if (oauthToken) {
      if (moment().isAfter(credentials.oneDriveExpiration)) {
        // refresh token
        console.log('getOneDriveAccessToken refreshing OneDrive token');
        const newToken = await oauthToken.refresh();
        // console.log('getOneDriveAccessToken newToken: ', newToken);
        // console.log('getOneDriveAccessToken newToken.token.access_token: ', newToken.token.access_token);

        // Update stored token
        credentials.oneDriveParams = JSON.stringify(newToken.token);
        credentials.oneDriveExpiration = moment(newToken.token.expires_at);
        await user.updateTokens(userId, credentials);
        return newToken.token.access_token;
      }

      // Token still valid, just return it
      return oauthToken.token.access_token;
    }
  }
  // if we get here we don't have a valid token, so log out user
  console.log('invalid token in getOneDriveAccessToken, clearing database fields');
  await user.updateTokens(userId, {
    oneDriveProfileId: null,
    oneDriveParams: null,
    oneDriveExpiration: null,
  });
  return null;
};

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

const handleOneDriveAuthentication = async (req, res) => {
  console.log('handleOneDriveAuthentication entry point -- ', req.url);
  if (await albumViewTokens.setSessionJwt(req, res)) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    res.json({ error: true });
  }
}

const signOutOneDriveUser = async (req, res) => {
  console.log('signOutOneDriveUser clearing database fields for user ', req.user.userId);
  await user.updateTokens(req.user.userId, {
    oneDriveProfileId: null,
    oneDriveParams: null,
    oneDriveExpiration: null,
  });
  await albumViewTokens.setSessionJwt(req, res);
  res.json({ signedOut: true });

  // req.session.destroy(function (err) {
  //   req.logout();
  //   res.redirect('/');
  // });
}

module.exports = {
  getOneDriveAccessToken,
  signInComplete,
  handleOneDriveAuthentication,
  signOutOneDriveUser,
};

/*
module.exports = {
  getOneDriveAccessToken: async function(req) {
    if (req.user && req.user.oauthToken) {
      console.log('getOneDriveAccessToken has token');
      // Get the stored token
      const storedToken = req.user.oauthToken;

      if (storedToken) {
        if (storedToken.expired()) {
          // refresh token
          const newToken = await storedToken.refresh();

          // Update stored token
          req.user.oauthToken = newToken;
          return newToken.token.access_token;
        }

        // Token still valid, just return it
        return storedToken.token.access_token;
      }
    } else {
      console.log('getOneDriveAccessToken failed to get token');
    }
  }
};
*/