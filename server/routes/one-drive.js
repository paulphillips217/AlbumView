// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const express = require('express');
const passport = require('passport');
const router = express.Router();
const oneDriveTokens = require('../oneDriveTokens');
const graph = require('../graph');

/* GET auth callback. */
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

router.get('/children/:id', async (req, res) => {
  try {
    console.log('one drive get folders, id is: ', req.params.id);
    const accessToken = oneDriveTokens.getOneDriveAccessToken(req);
    const children = await graph.getChildren(accessToken, req.params.id);

    if (children) {
      //console.log('children: ', JSON.stringify(children));
      res.json(children.value);
    }
    else {
      console.log('children is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
});

router.get('/file/:id', async (req, res) => {
  try {
    console.log('one drive get file, id is: ', req.params.id);
    const accessToken = oneDriveTokens.getOneDriveAccessToken(req);
    const file = await graph.getFile(accessToken, req.params.id);

    if (file) {
      //console.log('file: ', JSON.stringify(file));
      res.json(file.value);
    }
    else {
      console.log('file is empty');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: err });
  }
});

module.exports = router;
