// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

// for testing: to log out use      localStorage.setItem('accessToken', '');

import React from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import './styles/App.css';
import './styles/splitPane.css';
import './styles/flex-height.css';
import { setAccessToken, setRefreshToken } from './store/actions';
import {
  getAlbumViewTheme,
  getAuthenticationState,
  getContextType,
} from './store/selectors';
import { AlbumViewTheme, ContextType } from './store/types';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import AlbumContext from './components/AlbumContext';
import TrackContext from './components/TrackContext';
import PlaylistContext from './components/PlaylistContext';
import ArtistContext from './components/ArtistContext';
import RelatedArtistContext from './components/RelatedArtistContext';
import LocalFiles from './components/LocalFiles';
import LocalFileContext from './components/LocalFileContext';

const lightTheme = {
  backgroundColor: 'WhiteSmoke',
  color: 'black',
};

const darkTheme = {
  backgroundColor: '#202020',
  color: 'white',
};

const App = ({
  isAuthenticated,
  contextType,
  albumViewTheme,
  setAccessToken,
  setRefreshToken,
  httpService,
}) => {
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('refresh_token')) {
    setRefreshToken(urlParams.get('refresh_token'));
    console.log(`refresh token: ${urlParams.get('refresh_token')}`);
  }
  if (urlParams.has('access_token')) {
    setAccessToken(urlParams.get('access_token'));
    console.log(`access token: ${urlParams.get('access_token')}`);
    history.push('/');
  }

  const activeTheme =
    albumViewTheme === AlbumViewTheme.Light ? lightTheme : darkTheme;

  const loginComponent = (
    <div className="App">
      <h1>Album View</h1>
      <p>View your Spotify music collection</p>
      <a
        className={'spotify-button'}
        href={`${process.env.REACT_APP_SERVER_ROOT}/login`}
      >
        Connect to Spotify
      </a>
    </div>
  );

  const contextView = {};
  contextView[ContextType.Albums] = React.createElement(
    AlbumContext,
    {httpService},
    null
  );
  contextView[ContextType.Tracks] = React.createElement(
    TrackContext,
    {httpService},
    null
  );
  contextView[ContextType.Playlists] = React.createElement(
    PlaylistContext,
    {httpService},
    null
  );
  contextView[ContextType.Artists] = React.createElement(
    ArtistContext,
    {httpService},
    null
  );
  contextView[ContextType.RelatedArtists] = React.createElement(
    RelatedArtistContext,
    {httpService},
    null
  );
  contextView[ContextType.LocalFiles] = React.createElement(
    LocalFileContext,
    {httpService},
    null
  );

  if (isAuthenticated) {
    console.log('we are authenticated');
    return (
      <ThemeProvider theme={activeTheme}>
        {contextView[contextType]}
      </ThemeProvider>
    );
  } else {
    console.log('we are NOT authenticated');
    return loginComponent;
  }
};

App.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  contextType: PropTypes.string.isRequired,
  albumViewTheme: PropTypes.string.isRequired,
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  contextType: getContextType(state),
  albumViewTheme: getAlbumViewTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
