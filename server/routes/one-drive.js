// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const express = require('express');
const passport = require('passport');
const router = express.Router();
const oneDriveTokens = require('../tokens');
const graph = require('../graph');

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
    failureRedirect: '/?failure=true',
  }),
  (req, res) => {
    console.log('callback request user: ', req.user.oauthToken);
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

router.get('/:id', async (req, res) => {
  try {
    console.log('one drive getter, id is: ', req.params.id);
    const accessToken = oneDriveTokens.getOneDriveAccessToken(req);
    const drives = await graph.getDrives(accessToken, req.params.id);

    if (drives) {
      //console.log('drives: ', JSON.stringify(drives));
      res.json(drives.value);
    }
    else {
      console.log('drives is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
});

module.exports = router;
