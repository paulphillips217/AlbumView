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

const chatWithLastFm = async (url, method) => {
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
    console.error('chatWithLastFm error', err);
    return { emptyResponse: true };
  }
};

const getMusicBrainzId = async (artist, album) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&format=json&autocorrect=1`;
  //console.log('getMusicBrainzId url', url);
  const response = await chatWithLastFm(url, 'GET');
  //console.log('getMusicBrainzId response', response);
  if (response && response.album) {
    return response.album.mbid;
  }
  if (response.error) {
    console.error('getMusicBrainzId error: ', response.message);
  }
  return 'NOT-FOUND';
};

const getAlbumGenres = async (musicBrainzId, artist, album) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  let url = `http://ws.audioscrobbler.com/2.0?method=album.gettoptags&api_key=${apiKey}&format=json&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&autocorrect=1`;
  if (musicBrainzId && musicBrainzId !== '' && musicBrainzId !== 'NOT-FOUND') {
    url += `&mbid=${musicBrainzId}`;
  }
  console.log('getAlbumGenres url', url);
  const response = await chatWithLastFm(url, 'GET');
  //console.log('getAlbumGenres response', response);
  if (response && response.toptags) {
    return response.toptags.tag;
  }
  console.log('getAlbumGenres error response', response);
  return [];
};

module.exports = {
  talkToLastFm,
  getMusicBrainzId,
  getAlbumGenres,
};
