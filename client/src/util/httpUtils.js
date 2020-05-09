import axios from 'axios';
import { getAccessToken, getRefreshToken } from '../store/selectors';

class httpService {
  constructor(store) {
    this.store = store;
  }

  httpRequest = (options) => {
    const onSuccess = (response) => {
      console.debug('Request Successful!', response);
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
      'X-Spotify-access-token': getAccessToken(this.store),
      'X-Spotify-refresh-token': getRefreshToken(this.store),
    };

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
}

export default httpService;
