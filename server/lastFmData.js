const axios = require('axios');

const talkToLastFm = async (req, res) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const artist = encodeURIComponent(req.params.artist);
  const album = encodeURIComponent(req.params.album);
  const url = `http://ws.audioscrobbler.com/2.0?method=album.getinfo&api_key=${apiKey}&artist=${artist}&album=${album}&format=json`;

  axios({
    url: url,
    method: req.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log('axios got response for ', url);
      if (response && response.data) {
        //console.log('last.fm response', response.data);
        res.json(response.data);
      } else {
        console.log('axios got empty response');
        res.json({ emptyResponse: true });
      }
    })
    .catch((err) => {
      console.error('caught error in talkToLastFm: ', JSON.stringify(err));
      res.json({ empty: true });
    });
};

module.exports = {
  talkToLastFm,
};
