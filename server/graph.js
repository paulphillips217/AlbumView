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

  getDrives: async function (accessToken, id) {
    const client = getAuthenticatedClient(accessToken);
    if (!id) {
      id = 'root';
    }
    console.log('getDrives id: ', id);

    const drives = await client.api(`/me/drive/items/${id}/children`).get();
    return drives;
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
