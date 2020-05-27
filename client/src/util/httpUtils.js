import axios from 'axios';
import { getAccessToken, getRefreshToken } from '../store/selectors';
import { setAccessToken, setRefreshToken } from '../store/actions';

class httpService {
  constructor(state, dispatch) {
    this.state = state;
    this.dispatch = dispatch;
  }

  httpRequest = (options) => {
    const onSuccess = (response) => {
      if (response && response.data && response.data.credentials) {
        console.log('Received Spotify token reset');
        try {
          const accessToken = response.data.credentials.access_token;
          this.dispatch(setAccessToken(accessToken));
          const refreshToken = response.data.credentials.refresh_token;
          this.dispatch(setRefreshToken(refreshToken));
        } catch (err) {
          console.error(err);
        }
        return {};
      }
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
      'X-Spotify-access-token': getAccessToken(this.state),
      'X-Spotify-refresh-token': getRefreshToken(this.state),
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
