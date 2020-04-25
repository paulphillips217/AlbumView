const fetch = require('node-fetch');
const spotify = require('./credentials');

const getSpotifyAccessToken = (req, res, next) => {
  const { code } = req.query;

  if (code) {
    const url = 'https://accounts.spotify.com/api/token';

    const data = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotify.redirect_uri,
      client_id: spotify.client_id,
      client_secret: spotify.client_secret,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    const searchParams = new URLSearchParams();

    Object.keys(data).forEach(prop => {
      searchParams.set(prop, data[prop]);
    });

    console.log('posting access token to spotify');
    fetch(url, {
      method: 'POST',
      headers,
      body: searchParams,
    })
      .then(res => res.json())
      .then(credentials => {
        req.credentials = credentials;
        next();
      })
      .catch(next);
  }
};

const getAccessToken = (db, callback) => {
  db.find({}, (err, docs) => {
    if (err) {
      console.error('Failed to retrieve documents');
      throw Error('Failed to retrieve documents');
    }
    if (!docs) {
      console.error('Documents are empty');
      throw Error('Documents are empty');
    }

    callback(docs[0].access_token);
  });
};

module.exports = {
  getSpotifyAccessToken,
  getAccessToken
};
