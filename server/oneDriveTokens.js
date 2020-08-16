module.exports = {
  getOneDriveAccessToken: async function(req) {
    if (req.user) {
      // Get the stored token
      const storedToken = req.user.oauthToken;

      if (storedToken) {
        if (storedToken.expired()) {
          // refresh token
          const newToken = await storedToken.refresh();

          // Update stored token
          req.user.oauthToken = newToken;
          return newToken.token.access_token;
        }

        // Token still valid, just return it
        return storedToken.token.access_token;
      }
    }
  }
};
