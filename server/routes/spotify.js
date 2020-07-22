const express = require('express')
const router = express.Router();
const spotifyData = require('../spotifyData');
const authorizeSpotify = require('../authorizeSpotify');
const spotifyTokens = require('../accessToken');

router.get('/callback', spotifyTokens.getSpotifyAccessToken, (req, res, next) => {
  //console.log('callback - credentials: ' + JSON.stringify(req.credentials));
  try {
    //console.log('access token: ' + req.credentials.access_token);
    //console.log('refresh token: ' + req.credentials.refresh_token);
    console.log('token expiration: ' + req.credentials.token_expiration);
    //spotifyTokens.storeSpotifyAccessTokenInDatabase(pool, req.credentials);
    const clientUrl = process.env.CLIENT_URL;
    res.redirect(
      `${clientUrl}/?spotify_access_token=${req.credentials.access_token}&spotify_refresh_token=${req.credentials.refresh_token}&spotify_token_expiration=${req.credentials.token_expiration}`
    );
  } catch (err) {
    console.error(err);
  }
});

router.get('/login', authorizeSpotify);
router.get('/history', spotifyData.talkToSpotify);
router.get('/search/:query/:type', spotifyData.talkToSpotify);
router.get('/playlist-list/:offset/:limit', spotifyData.talkToSpotify);
router.get('/playlist-tracks/:id/:offset/:limit', spotifyData.talkToSpotify);
router.get('/playlist-data/:id', spotifyData.talkToSpotify);
router.get('/album-data/:id', spotifyData.talkToSpotify);
router.get('/album-list/:offset/:limit', spotifyData.talkToSpotify);
router.get('/albums/contains/:ids', spotifyData.talkToSpotify);
router.get('/track-list/:offset/:limit', spotifyData.talkToSpotify);
router.get('/tracks/contains/:ids', spotifyData.talkToSpotify);
router.get('/artist-data/:id', spotifyData.talkToSpotify);
router.get('/artist-list/:offset/:limit', spotifyData.aggregateSpotifyArtistData);
router.get('/artist-albums/:id/:offset/:limit', spotifyData.talkToSpotify);
router.get('/related-artists/:id', spotifyData.talkToSpotify);
router.get('/player-status', spotifyData.talkToSpotify);
router.put('/player-pause', spotifyData.talkToSpotify);
router.put('/player-shuffle/:state', spotifyData.talkToSpotify);
router.put('/save-tracks/:ids', spotifyData.talkToSpotify);
router.put('/save-albums/:ids', spotifyData.talkToSpotify);
router.delete('/delete-tracks/:ids', spotifyData.talkToSpotify);
router.delete('/delete-albums/:ids', spotifyData.talkToSpotify);
router.post('/queue-track/:uri', spotifyData.talkToSpotify);
router.post('/player-next', spotifyData.talkToSpotify);

module.exports = router
