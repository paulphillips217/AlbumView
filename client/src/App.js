// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

// for testing: to log out use      localStorage.setItem('accessToken', '');

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import './styles/App.css';
import './styles/splitPane.css';
import './styles/flex-height.css';
import {
  setAlbumJobId,
  setAlbumViewIsAuthenticated,
  setOneDriveLoggedIn,
  setSavedAlbumData,
  setSpotifyIsAuthenticated,
} from './store/actions';
import { getAlbumViewTheme, getContextType, getSavedAlbumData } from './store/selectors';
import { AlbumViewTheme, ContextType } from './store/types';
import PropTypes from 'prop-types';
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
  savedAlbumData,
  contextType,
  albumViewTheme,
  setAlbumViewLoggedIn,
  setSpotifyLoggedIn,
  setOneDriveLoggedIn,
  setAlbumData,
  setJobId,
  httpService,
}) => {
  useEffect(() => {
    const handleAuth = async () => {
      console.log('Album View Cookie: ', document.cookie);
      if (!document.cookie) {
        console.log('empty cookie in Auth, logging in');
        await httpService.get(`/album-view/login`);
      } else {
        setAlbumViewLoggedIn(true);
      }
      const isSpotifyAuthenticated = document.cookie.includes('spotify=');
      setSpotifyLoggedIn(isSpotifyAuthenticated);
      setOneDriveLoggedIn(document.cookie.includes('oneDrive='));

      if (savedAlbumData.spotifyCount < 0 && isSpotifyAuthenticated) {
        console.log('AlbumView App - refreshing saved album data');
        const data = await httpService.get(`/spotify/album-list-refresh`);
        console.log('handleAuth got savedAlbum data: ', data);
        if (data && data.count >= 0) {
          setAlbumData({
            spotifyCount: data.count,
            data: [],
          });
        }
        if (data && data.jobId > 0) {
          setJobId(parseInt(data.jobId));
        }
      }
    };
    handleAuth();
  }, [
    httpService,
    savedAlbumData.spotifyCount,
    setAlbumData,
    setAlbumViewLoggedIn,
    setJobId,
    setOneDriveLoggedIn,
    setSpotifyLoggedIn,
  ]);

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
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  contextType: PropTypes.string.isRequired,
  albumViewTheme: PropTypes.string.isRequired,
  setAlbumViewLoggedIn: PropTypes.func.isRequired,
  setSpotifyLoggedIn: PropTypes.func.isRequired,
  setOneDriveLoggedIn: PropTypes.func.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setJobId: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
  contextType: getContextType(state),
  albumViewTheme: getAlbumViewTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumViewLoggedIn: (isLoggedIn) => dispatch(setAlbumViewIsAuthenticated(isLoggedIn)),
  setSpotifyLoggedIn: (isAuthenticated) =>
    dispatch(setSpotifyIsAuthenticated(isAuthenticated)),
  setOneDriveLoggedIn: (isLoggedIn) => dispatch(setOneDriveLoggedIn(isLoggedIn)),
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setJobId: (data) => dispatch(setAlbumJobId(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
