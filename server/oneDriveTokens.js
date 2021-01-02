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
        user.updateTokens(userId, credentials);
        return newToken.token.access_token;
      }

      // Token still valid, just return it
      return oauthToken.token.access_token;
    }
  }
  return null;
};

const handleOneDriveAuthentication = async (req, res) => {
  console.log('handleOneDriveAuthentication entry point -- ', req.url);
  if (await albumViewTokens.setSessionJwt(req, res)) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    res.json({ error: true });
  }
}

module.exports = {
  getOneDriveAccessToken,
  handleOneDriveAuthentication,
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