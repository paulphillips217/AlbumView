import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  getTokenExpiration,
} from '../store/selectors';
import {
  setAccessToken,
  setRefreshToken,
  setTokenExpiration,
} from '../store/actions';

class httpService {
  constructor(store) {
    this.store = store;
    //console.log('httpService constructor store: ', store);
  }

  httpRequest = (options) => {
    const onSuccess = (response) => {
      console.debug('httpRequest got response', response);
      console.log('axios response headers: ', response.headers);
      try {
        const oldAccessToken = getAccessToken(this.store.getState());
        const newAccessToken = response.headers['x-spotify-access-token'];
        if (oldAccessToken !== newAccessToken) {
          console.log('capturing headers from response');
          this.store.dispatch(setAccessToken(newAccessToken));
          const refreshToken = response.headers['x-spotify-refresh-token'];
          this.store.dispatch(setRefreshToken(refreshToken));
          const tokenExpiration =
            response.headers['x-spotify-token-expiration'];
          this.store.dispatch(setTokenExpiration(tokenExpiration));
        }
      } catch (err) {
        console.error(err);
      }

      console.debug('Request Successful!');
      return response.data;
    };

    const onError = (error) => {
      console.error('Request Failed:', error.config);

      if (error.response) {
        // Request was made but server responded with something
        // other than 2xx
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else {
        // Something else happened while setting up the request
        // triggered the error
        console.error('Error Message:', error.message);
      }

      return Promise.reject(error.response || error.message);
    };

    options.headers = {
      'x-spotify-access-token': getAccessToken(this.store.getState()),
      'x-spotify-refresh-token': getRefreshToken(this.store.getState()),
      'x-spotify-token-expiration': getTokenExpiration(this.store.getState()),
    };

    console.log('httpService making request', options);
    return axios(options).then(onSuccess).catch(onError);
  };

  get = (url) => {
    return this.httpRequest({
      url: url,
      method: 'GET',
    });
  };

  post = (url, data = {}) => {
    return this.httpRequest({
      url: url,
      method: 'POST',
      data: data,
    });
  };

  put = (url) => {
    return this.httpRequest({
      url: url,
      method: 'PUT',
    });
  };

  delete = (url) => {
    return this.httpRequest({
      url: url,
      method: 'DELETE',
    });
  };
}

export default httpService;
