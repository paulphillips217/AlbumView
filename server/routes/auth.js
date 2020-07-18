// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET auth callback. */
router.get('/signin', function (req, res, next) {
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
    failureRedirect: '/',
  }),
  (req, res) => {
    //console.log('callback request user: ', req.user.oauthToken);
    res.redirect('/?oneDriveLogin=true');
  }
);
/*
router.post('/callback',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,
        failureRedirect: '/',
        failureFlash: true,
        successRedirect: '/?oneDriveLogin=true'
      }
    )(req,res,next);
  }
);
*/
router.get('/signout', function (req, res) {
  req.session.destroy(function (err) {
    req.logout();
    res.redirect('/');
  });
});

module.exports = router;
