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
    .then((res) => res.json())
    .then((data) => data)
    .catch((error) => console.log(error));
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
    body: body,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log('postSpotifyData response: ');
      console.log(data);
      return data;
    })
    .catch((error) => console.log(error));
};

const putSpotifyData = (accessToken, url, body = '') => {
  console.log('putSpotifyData url: ' + url);
  return fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body,
  })
    .then((res) => {
      console.log('putSpotifyData res: ' + JSON.stringify(res));
      // avoid error by checking for json before trying to convert
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return res.json();
      } else {
        //if response is not json return empty object
        return {};
      }
    })
    .then((data) => {
      console.log('putSpotifyData response: ');
      console.log(data);
      return data;
    })
    .catch((error) => console.log(error));
};

const deleteSpotifyData = (accessToken, url, body = '') => {
  console.log('deleteSpotifyData url: ' + url);
  return fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body,
  })
    .then((res) => {
      console.log('deleteSpotifyData res: ' + JSON.stringify(res));
      // avoid error by checking for json before trying to convert
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return res.json();
      } else {
        //if response is not json return empty object
        return {};
      }
    })
    .then((data) => {
      console.log('deleteSpotifyData response: ');
      console.log(data);
      return data;
    })
    .catch((error) => console.log(error));
};

module.exports = {
  getSpotifyData,
  postSpotifyData,
  putSpotifyData,
  deleteSpotifyData,
};
