const fetch = require('node-fetch');

const getSpotifyData = (accessToken, url) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(res => res.json())
    .then(data => data)
    .catch(error => console.log(error));
};

const postSpotifyData = (accessToken, url, body = '') => {
  console.log('postSpotifyData url: ' + url);
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body
  })
    .then(res => res.json())
    .then(data => {
      console.log('postSpotifyData response: ')
      console.log(data);
      return data;})
    .catch(error => console.log(error));
};

module.exports = {
  getSpotifyData,
  postSpotifyData
};
