const spotify = require("./credentials");

const authorizeSpotify = (req, res) => {
  console.log("login url process");
  const scopes =
    "user-read-recently-played playlist-read-private playlist-read-collaborative user-modify-playback-state";

  const url = `https://accounts.spotify.com/authorize?&client_id=${
    spotify.client_id
  }&redirect_uri=${encodeURI(
    spotify.redirect_uri
  )}&response_type=code&scope=${scopes}`;

  res.redirect(url);
};

module.exports = authorizeSpotify;
