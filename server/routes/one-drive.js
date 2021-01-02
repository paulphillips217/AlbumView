const express = require('express');
const passport = require('passport');
const router = express.Router();
const oneDriveTokens = require('../oneDriveTokens');
const oneDriveData = require('../oneDriveData');

router.get('/signin', function (req, res, next) {
  //console.log('one-drive sign in', req);
  passport.authenticate('azuread-openidconnect', {
    response: res,
    prompt: 'login',
    failureRedirect: '/',
    failureFlash: true,
    successRedirect: '/',
  })(req, res, next);
});

router.post(
  '/callback',
  passport.authenticate('azuread-openidconnect', {
    failureRedirect: '/?failure=true',
  }),
  oneDriveTokens.handleOneDriveAuthentication
);

router.get('/signout', function (req, res) {
  req.session.destroy(function (err) {
    req.logout();
    res.redirect('/');
  });
});

router.get('/children/:id', oneDriveData.getOneDriveFolders);

router.get('/file/:id', oneDriveData.getOneDriveFile);

module.exports = router;
