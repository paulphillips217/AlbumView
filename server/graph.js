// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
  getUserDetails: async function (accessToken) {
    const client = getAuthenticatedClient(accessToken);

    const user = await client.api('/me').get();
    return user;
  },

  getFolders: async function (accessToken, id) {
    const client = getAuthenticatedClient(accessToken);
    if (!id) {
      id = 'root';
    }
    console.log('getFolders id: ', id);

    const folders = await client.api(`/me/drive/items/${id}/children`).get();
    return folders;
  },

  getFile: async function (accessToken, id) {
    const client = getAuthenticatedClient(accessToken);
    if (!id) {
      id = 'root';
    }
    console.log('getFile id: ', id);

    const file = await client.api(`/me/drive/items/${id}`).get();
    return file;
  },
};

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  return client;
}
