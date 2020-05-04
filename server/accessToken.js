const fetch = require("node-fetch");
const spotify = require("./credentials");

const getSpotifyAccessToken = (req, res, next) => {
  const { code } = req.query;

  if (code) {
    const url = "https://accounts.spotify.com/api/token";

    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: spotify.redirect_uri,
      client_id: spotify.client_id,
      client_secret: spotify.client_secret,
    };

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    const searchParams = new URLSearchParams();

    Object.keys(data).forEach((prop) => {
      searchParams.set(prop, data[prop]);
    });

    console.log("posting access token to spotify");
    fetch(url, {
      method: "POST",
      headers,
      body: searchParams,
    })
      .then((res) => res.json())
      .then((credentials) => {
        req.credentials = credentials;
        next();
      })
      .catch(next);
  }
};

const storeAccessToken = (pool, token) => {
  try {
    pool.query(
      "UPDATE credentials SET credential = $1 WHERE id = 1",
      [token],
      (error, results) => {
        if (error) {
          console.error(error);
          throw error;
        }
        console.log(`storeAccessToken result: ${results}`);
      }
    );
  } catch (err) {
    console.error(err);
  }
};

const getAccessToken = (pool, callback) => {
  try {
    pool.query("SELECT * FROM credentials WHERE id = 1", (error, results) => {
      if (error) {
        console.error(error);
        throw error;
      }
      const credential = results.rows[0].credential;
      const accessToken = JSON.parse(credential).access_token;
      callback(accessToken);
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getSpotifyAccessToken,
  storeAccessToken,
  getAccessToken
};
