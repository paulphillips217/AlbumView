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
      console.log('setSessionJwt found userId from oneDrive oid: ', userId, req.user.oneDriveProfileId);
      if (req.credentials) {
        await user.updateTokens(userId, req.credentials);
      }
    } else if (req.credentials && req.credentials.spotifyAuthToken) {
      userId = await user.getUserFromSpotifyToken(req.credentials.spotifyAuthToken);
      console.log('setSessionJwt got existing user from spotify credentials', userId);
      if (userId === 0) {
        userId = await user.initializeSpotifyUser(req.credentials);
        console.log('setSessionJwt initialized user from spotify credentials', userId);
      }
    }
  } catch (err) {
    console.error('got error setting userId in setSessionJwt', err.name, err.message);
  }

  if (userId <= 0) {
    console.log('setSessionJwt returning false because userId is empty');
    // res.status(400).send({ error: 'database error' });
    return false;
  }

  // This is what ends up in our JWT
  const payload = {
    userId: userId,
    expires: moment().add(parseInt(process.env.JWT_EXPIRATION_HOURS), 'hours'),
  };

  // add spotify and oneDrive cookies if logged in
  const spotifyCredentials = await user.getSpotifyCredentials(userId);
  const spotifyLoggedIn = !!(spotifyCredentials.spotifyAuthToken);
  const oneDriveCredentials = await user.getOneDriveCredentials(userId);
  const oneDriveLoggedIn = !!(oneDriveCredentials.oneDriveProfileId);

  // assigns payload to req.user
  req.login(payload, { session: false }, (error) => {
    if (error) {
      console.log('setSessionJwt req.login got error: ', error);
      // res.status(400).send({ error });
      return false;
    }

    // generate a signed json web token and return it in the response
    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);

    // assign our jwt to the cookie
    console.log('setSessionJwt setting cookies: ', spotifyLoggedIn, oneDriveLoggedIn);
    res.cookie('jwt', token, { httpOnly: true });
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
    //res.redirect(process.env.CLIENT_URL);
  });
  return true;
};

module.exports = {
  setSessionJwt,
};
