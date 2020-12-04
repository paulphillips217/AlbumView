const axios = require('axios');

const talkToTheAudioDb = async (req, res) => {
  const apiKey = process.env.THE_AUDIO_DB_API_KEY;
  const artist = encodeURIComponent(req.params.artist);
  const album = encodeURIComponent(req.params.album);
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/searchalbum.php?s=${artist}&a=${album}`;

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

const chatWithTheAudioDb = async (url, method) => {
  try {
    const response = await axios({
      url: url,
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('axios got response for ', url);
    if (response && response.data) {
      return response.data;
    } else {
      console.log('axios got empty response');
      return { emptyResponse: true };
    }
  } catch (err) {
    console.error('chatWithTheAudioDb error', err);
    return { emptyResponse: true };
  }
};

const getAlbumData = async (artist, album) => {
  const apiKey = process.env.THE_AUDIO_DB_API_KEY;
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/searchalbum.php?s=${artist}&a=${album}`;
  console.log('getAlbumData url', url);
  const response = await chatWithTheAudioDb(url, 'GET');
  //console.log('getAlbumData response', response);
  if (response && response.album) {
    return response.album[0];
  }
  if (response.error) {
    console.error('getAlbumData error: ', response.message);
  }
  return 'NOT-FOUND';
};

module.exports = {
  talkToTheAudioDb,
  getAlbumData,
};
