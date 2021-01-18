const express = require('express')
const router = express.Router();
const albumViewData = require('../albumViewData');
const passport = require('passport');

router.get('/genre-list',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getGenreList);

router.get('/album-genre-list',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getAlbumGenreList);

router.post('/user-owned-albums',
  passport.authenticate('jwt', { session: false }),
  albumViewData.integrateUserOwnedAlbums);

router.get('/job-progress/:id',
  passport.authenticate('jwt', { session: false }),
  albumViewData.getJobProgress);

module.exports = router
