const express = require('express');
const router = express.Router();
const moment = require('moment');
const spotifyData = require('../spotifyData');
const authorizeSpotify = require('../authorizeSpotify');
const spotifyTokens = require('../spotifyTokens');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const user = require('../data/user');

// jwt session code comes from
// https://blog.usejournal.com/sessionless-authentication-withe-jwts-with-node-express-passport-js-69b059e4b22c

const setSessionJwt = async (req, res) => {
  console.log('setSessionJwt entry point -- ', req.url);

  const userId = await user.initializeUser(req.credentials);
  console.log('setSessionJwt initialized user', userId);
  if (userId <= 0) {
    res.status(400).send({ error: 'database error' });
    return;
  }

  /** This is what ends up in our JWT */
  const payload = {
    userId: userId,
    expires: moment().add(parseInt(process.env.JWT_EXPIRATION_HOURS), 'hours'),
  };

  /** assigns payload to req.user */
  req.login(payload, { session: false }, (error) => {
    if (error) {
      res.status(400).send({ error });
      return;
    }

    /** generate a signed json web token and return it in the response */
    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);

    /** assign our jwt to the cookie */
    res.cookie('jwt', token, { httpOnly: true });
    res.cookie('spotify', 'true');

    res.redirect(process.env.CLIENT_URL);
  });
};

router.get('/login', authorizeSpotify);
router.get('/callback', spotifyTokens.getSpotifyAccessToken, setSessionJwt);
router.get(
  '/history',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/search/:query/:type',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/playlist-list/:offset/:limit',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/playlist-tracks/:id/:offset/:limit',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/playlist-data/:id',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/album-data/:id',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/album-list-refresh',
  passport.authenticate('jwt', { session: false }),
  spotifyData.refreshSavedAlbums
);
router.get(
  '/album-list-fetch',
  passport.authenticate('jwt', { session: false }),
  spotifyData.fetchSavedAlbums
);
router.get(
  '/albums/contains/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/track-list/:offset/:limit',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/tracks/contains/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/artist-data/:id',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/artist-list/:offset/:limit/:artists/:albums/:tracks',
  passport.authenticate('jwt', { session: false }),
  spotifyData.aggregateSpotifyArtistData
);
router.get(
  '/artist-albums/:id/:offset/:limit',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/related-artists/:id',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.get(
  '/player-status',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.put(
  '/player-pause',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.put(
  '/player-shuffle/:state',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.put(
  '/save-tracks/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.put(
  '/save-albums/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.delete(
  '/delete-tracks/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.delete(
  '/delete-albums/:ids',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.post(
  '/queue-track/:uri',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);
router.post(
  '/player-next',
  passport.authenticate('jwt', { session: false }),
  spotifyData.talkToSpotify
);

module.exports = router;
