const express = require('express')
const router = express.Router();
const theAudioDbData = require('../theAudioDbData');

router.get('/the-audio-db/:artist/:album', theAudioDbData.talkToTheAudioDb);

module.exports = router
