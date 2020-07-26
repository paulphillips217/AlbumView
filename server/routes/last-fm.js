const express = require('express')
const router = express.Router();
const lastFmData = require('../lastFmData');

router.get('/last-album/:artist/:album', lastFmData.talkToLastFm);

module.exports = router
