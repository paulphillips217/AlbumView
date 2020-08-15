import axios from 'axios';
import {
  getSpotifyAccessToken,
  getSpotifyRefreshToken,
  getSpotifyTokenExpiration,
} from '../store/selectors';
import {
  setSpotifyAccessToken,
  setSpotifyRefreshToken,
  setSpotifyTokenExpiration,
} from '../store/actions';

class HttpService {
  constructor(store) {
    this.store = store;
    // console.log('HttpService constructor store: ', store);
  }

  httpRequest(options) {
    const onSuccess = (response) => {
      console.debug('httpRequest got response', response);
      // console.log('axios response headers: ', response.headers);
      try {
        const oldSpotifyAccessToken = getSpotifyAccessToken(this.store.getState());
        const newSpotifyAccessToken = response.headers['x-spotify-access-token'];
        if (newSpotifyAccessToken && newSpotifyAccessToken !== 'undefined' && oldSpotifyAccessToken !== newSpotifyAccessToken) {
          console.log('capturing headers from response');
          this.store.dispatch(setSpotifyAccessToken(newSpotifyAccessToken));
          const spotifyRefreshToken = response.headers['x-spotify-refresh-token'];
          this.store.dispatch(setSpotifyRefreshToken(spotifyRefreshToken));
          const spotifyTokenExpiration = response.headers['x-spotify-token-expiration'];
          this.store.dispatch(setSpotifyTokenExpiration(spotifyTokenExpiration));
        }
      } catch (err) {
        console.error(err);
      }

      return response.data;
    };

    const onError = (error) => {
      console.error('Request Failed:', error.config);

      if (error.response) {
        // Request was made but server responded with something other than 2xx
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else {
        // Something else happened while setting up the request triggered the error
        console.error('Error Message:', error.message);
      }

      return Promise.reject(error.response || error.message);
    };

    const requestOptions = options;
    requestOptions.withCredentials = true;
    requestOptions.headers = {
      'x-spotify-access-token': getSpotifyAccessToken(this.store.getState()),
      'x-spotify-refresh-token': getSpotifyRefreshToken(this.store.getState()),
      'x-spotify-token-expiration': getSpotifyTokenExpiration(this.store.getState()),
    };

    // console.log('httpService making request', options);
    return axios(requestOptions).then(onSuccess).catch(onError);
  }

  get(url) {
    return this.httpRequest({
      url,
      method: 'GET',
    });
  }

  post(url, data = {}) {
    return this.httpRequest({
      url,
      method: 'POST',
      data,
    });
  }

  put(url) {
    return this.httpRequest({
      url,
      method: 'PUT',
    });
  }

  delete(url) {
    return this.httpRequest({
      url,
      method: 'DELETE',
    });
  }
}

export default HttpService;
