import React from 'react';
import '../styles/App.css';

const SpotifyLogin = () => (
  <div className="App">
    <a
      className="spotify-button"
      style={{ marginTop: '100px' }}
      href={`${process.env.REACT_APP_SERVER_ROOT}/spotify/login`}
    >
      Connect to Spotify
    </a>
  </div>
);

export default SpotifyLogin;
