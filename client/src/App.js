// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

// for testing: to log out use      localStorage.setItem('accessToken', '');

import React from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import './styles/App.css';
import './styles/splitPane.css';
import './styles/flex-height.css';
import { setOneDriveLoggedIn, setSpotifyIsAuthenticated } from './store/actions';
import { getAlbumViewTheme, getContextType } from './store/selectors';
import { AlbumViewTheme, ContextType } from './store/types';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import AlbumContext from './components/AlbumContext';
import TrackContext from './components/TrackContext';
import PlaylistContext from './components/PlaylistContext';
import ArtistContext from './components/ArtistContext';
import RelatedArtistContext from './components/RelatedArtistContext';
import LocalFileContext from './components/LocalFileContext';
import OneDriveFileContext from './components/OneDriveContext';

const lightTheme = {
  backgroundColor: 'WhiteSmoke',
  color: 'black',
};

const darkTheme = {
  backgroundColor: '#202020',
  color: 'white',
};

const App = ({
  contextType,
  albumViewTheme,
  setSpotifyLoggedIn,
  setOneDriveLoggedIn,
  httpService,
}) => {
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);

  console.log('Album View Cookie: ', document.cookie);
  setSpotifyLoggedIn(document.cookie.includes('spotify='));

  if (urlParams.has('oneDriveLogin')) {
    setOneDriveLoggedIn(urlParams.get('oneDriveLogin'));
    console.log(`oneDriveLogin is set`);
    history.push('/');
  }

  const activeTheme = albumViewTheme === AlbumViewTheme.Light ? lightTheme : darkTheme;

  const contextView = {};
  contextView[ContextType.Albums] = React.createElement(
    AlbumContext,
    { httpService },
    null
  );
  contextView[ContextType.Tracks] = React.createElement(
    TrackContext,
    { httpService },
    null
  );
  contextView[ContextType.Playlists] = React.createElement(
    PlaylistContext,
    { httpService },
    null
  );
  contextView[ContextType.Artists] = React.createElement(
    ArtistContext,
    { httpService },
    null
  );
  contextView[ContextType.RelatedArtists] = React.createElement(
    RelatedArtistContext,
    { httpService },
    null
  );
  contextView[ContextType.LocalFiles] = React.createElement(
    LocalFileContext,
    { httpService },
    null
  );
  contextView[ContextType.OneDriveFiles] = React.createElement(
    OneDriveFileContext,
    { httpService },
    null
  );

  return <ThemeProvider theme={activeTheme}>{contextView[contextType]}</ThemeProvider>;
};

App.propTypes = {
  contextType: PropTypes.string.isRequired,
  albumViewTheme: PropTypes.string.isRequired,
  setSpotifyLoggedIn: PropTypes.func.isRequired,
  setOneDriveLoggedIn: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  albumViewTheme: getAlbumViewTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  setSpotifyLoggedIn: (isAuthenticated) =>
    dispatch(setSpotifyIsAuthenticated(isAuthenticated)),
  setOneDriveLoggedIn: (isLoggedIn) => dispatch(setOneDriveLoggedIn(isLoggedIn)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
