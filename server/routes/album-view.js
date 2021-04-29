const express = require('express');
const router = express.Router();
const albumViewTokens = require('../albumViewTokens');
const albumViewData = require('../albumViewData');
const passport = require('passport');

router.get('/login', albumViewTokens.handleAuthentication);

router.get(
  '/album-list-fetch/:genreId',
  passport.authenticate('jwt', { session: false }),
  albumViewData.fetchSavedAlbums
);

router.get(
  '/genre-list',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getGenreList
);

router.get(
  '/album-genre-list',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getAlbumGenreList
);

router.post(
  '/user-owned-albums',
  passport.authenticate('jwt', { session: false }),
  albumViewData.integrateUserOwnedAlbums
);

router.get(
  '/job-progress/:id',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getJobProgress
);

router.get(
  '/artist-list',
  passport.authenticate('jwt', { session: false }),
  albumViewData.fetchSavedArtists
);

router.get(
  '/artist-wiki/:id',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getWikiArtistArticle
);

module.exports = router;
