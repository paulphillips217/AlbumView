const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const getAuthenticatedClient = (accessToken) => {
  // Initialize Graph client
  return graph.Client.init({
    // Use the provided access token to authenticate requests
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};

/*
const getUserDetails = async (accessToken) => {
  const client = getAuthenticatedClient(accessToken);

  const user = await client.api('/me').get();
  return user;
};
*/

const getChildren = async (accessToken, id) => {
  const client = getAuthenticatedClient(accessToken);
  if (!id) {
    id = 'root';
  }
  console.log('getChildren id: ', id);

  return await client.api(`/me/drive/items/${id}/children`).get();
};

const getFile = async (accessToken, id) => {
  const client = getAuthenticatedClient(accessToken);
  if (!id) {
    id = 'root';
  }
  console.log('getFile id: ', id);

  return await client.api(`/me/drive/items/${id}`).get();
};

module.exports = {
  getChildren,
  getFile,
};
