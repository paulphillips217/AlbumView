import axios from 'axios';

class HttpService {
  constructor(store) {
    this.store = store;
    // console.log('HttpService constructor store: ', store);
  }

  httpRequest(options) {
    const onSuccess = (response) => {
      console.debug('httpRequest got response', response);
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
