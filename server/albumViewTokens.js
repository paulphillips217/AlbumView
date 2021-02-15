const moment = require('moment');
const jwt = require('jsonwebtoken');
const user = require('./data/user');

// jwt session code initially comes from
// https://blog.usejournal.com/sessionless-authentication-withe-jwts-with-node-express-passport-js-69b059e4b22c
const setSessionJwt = async (req, res) => {
  let userId = 0;

  try {
    if (req.user && req.user.userId) {
      userId = req.user.userId;
      console.log('setSessionJwt found userId in jwt', userId);
      if (req.credentials) {
        await user.updateTokens(userId, req.credentials);
      }
    } else if (req.user && req.user.oneDriveProfileId) {
      userId = await user.getUserFromOneDriveId(req.user.oneDriveProfileId);
      console.log(
        'setSessionJwt found userId from oneDrive oid: ',
        userId,
        req.user.oneDriveProfileId
      );
      if (req.credentials) {
        await user.updateTokens(userId, req.credentials);
      }
    } else if (req.credentials && req.credentials.spotifyAuthToken) {
      userId = await user.getUserFromSpotifyToken(
        req.credentials.spotifyAuthToken
      );
      console.log(
        'setSessionJwt got existing user from spotify credentials',
        userId
      );
      if (userId === 0 && req.credentials) {
        userId = await user.initializeNewUser(req.credentials);
        console.log(
          'setSessionJwt initialized user from spotify credentials',
          userId
        );
      }
    } else {
      userId = await user.initializeNewUser();
      console.log(
        'setSessionJwt initialized user without any credentials',
        userId
      );
    }
  } catch (err) {
    console.error(
      'got error setting userId in setSessionJwt',
      err.name,
      err.message
    );
  }

  if (userId <= 0) {
    console.log('setSessionJwt returning false because userId is empty');
    return false;
  }

  // This is what ends up in our JWT
  const payload = {
    userId: userId,
    expires: moment().add(parseInt(process.env.JWT_EXPIRATION_HOURS), 'hours'),
  };

  // add spotify and oneDrive cookies if logged in
  const spotifyCredentials = await user.getSpotifyCredentials(userId);
  const spotifyLoggedIn =
    spotifyCredentials && spotifyCredentials.spotifyAuthToken;
  const oneDriveCredentials = await user.getOneDriveCredentials(userId);
  const oneDriveLoggedIn =
    oneDriveCredentials && oneDriveCredentials.oneDriveProfileId;

  // assigns payload to req.user
  req.login(payload, { session: false }, (error) => {
    if (error) {
      console.log('setSessionJwt req.login got error: ', error);
      return false;
    }

    // generate a signed json web token and return it in the response
    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);

    // assign our jwt to the cookie
    console.log(
      'setSessionJwt setting cookies: ',
      spotifyLoggedIn,
      oneDriveLoggedIn
    );
    // res.cookie('jwt', token, { httpOnly: true });
    res.cookie('jwt', token);
    if (spotifyLoggedIn) {
      res.cookie('spotify', 'true');
    } else {
      res.cookie('spotify', '', { maxAge: 0 });
    }
    if (oneDriveLoggedIn) {
      res.cookie('oneDrive', 'true');
    } else {
      res.cookie('oneDrive', '', { maxAge: 0 });
    }
  });
  return true;
};

const handleAuthentication = async (req, res) => {
  console.log('handleAuthentication entry point -- ', req.url);
  if (await setSessionJwt(req, res)) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    res.json({ error: true });
  }
};

module.exports = {
  setSessionJwt,
  handleAuthentication,
};
