const express = require('express');
const router = express.Router();
const spotifyData = require('../spotifyData');
const spotifyTokens = require('../spotifyTokens');
const passport = require('passport');

router.get('/login', spotifyTokens.authorizeSpotify);
router.get('/logout', spotifyTokens.logOutSpotifyUser);
router.get(
  '/callback',
  spotifyTokens.getSpotifyAccessToken,
  spotifyTokens.handleSpotifyAuthentication
);
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
  '/artist-list',
  passport.authenticate('jwt', { session: false }),
  spotifyData.fetchSavedArtists
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
