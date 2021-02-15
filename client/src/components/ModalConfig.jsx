import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import { Button, Dropdown, Modal, Tab } from 'semantic-ui-react';
import {
  getAlbumSort,
  getAlbumViewTheme,
  getContextGridColumns,
  getContextSortType,
  getLocalFileData,
  getOneDriveLoggedIn,
  getPlaylistSort,
  getPlaylistTrackSort,
  getSavedAlbumData,
  getSavedTrackSort,
  getSelectedGenre,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import {
  setAlbumSort,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextItem,
  resetContextListData,
  setPlaylistSort,
  setPlaylistTrackSort,
  setRelatedToArtist,
  setSavedTrackSort,
  setSavedAlbumData,
} from '../store/actions';
import { AlbumViewTheme, SortTypes } from '../store/types';
import HttpService from '../util/httpUtils';
import '../styles/App.css';
import { getUserAlbums } from '../util/utilities';

const ModalConfig = ({
  isSpotifyAuthenticated,
  isOneDriveLoggedIn,
  localFileData,
  contextSortType,
  genre,
  albumViewTheme,
  contextGridColumns,
  albumSort,
  playlistSort,
  savedTrackSort,
  playlistTrackSort,
  savedAlbumData,
  setAlbumData,
  setTheme,
  setGridColumns,
  setItem,
  setRelatedTo,
  resetListData,
  setAlbumSortOrder,
  setPlaylistSortOrder,
  setSavedTrackSortOrder,
  setPlaylistTrackSortOrder,
  httpService,
}) => {
  const theme = useTheme();
  const history = useHistory();

  const themeListOptions = [
    {
      key: 'light-theme-key',
      text: 'Light',
      value: AlbumViewTheme.Light,
    },
    {
      key: 'dark-theme-key',
      text: 'Dark',
      value: AlbumViewTheme.Dark,
    },
  ];

  const albumSortListOptions = [
    {
      key: 'artist-album-name',
      text: 'Artist, Album Name',
      value: SortTypes.ArtistThenAlbumName,
    },
    {
      key: 'artist-album-date',
      text: 'Artist, Album Date',
      value: SortTypes.ArtistThenAlbumDate,
    },
  ];

  const playlistSortListOptions = [
    {
      key: 'playlist-name',
      text: 'Playlist Name',
      value: SortTypes.PlaylistName,
    },
    {
      key: 'playlist-author',
      text: 'Playlist Author',
      value: SortTypes.PlaylistAuthor,
    },
  ];

  const savedTrackSortListOptions = [
    {
      key: 'st-artist-album-name',
      text: 'Artist, Album Name',
      value: SortTypes.ArtistThenAlbumName,
    },
    {
      key: 'st-artist-album-date',
      text: 'Artist, Album Date',
      value: SortTypes.ArtistThenAlbumDate,
    },
    {
      key: 'st-artist-track-name',
      text: 'Artist, Track Name',
      value: SortTypes.ArtistThenTrackName,
    },
    {
      key: 'st-track-name',
      text: 'Track Name',
      value: SortTypes.TrackName,
    },
  ];

  const playlistTrackSortListOptions = [
    {
      key: 'pt-playlist-order',
      text: 'Playlist Order',
      value: SortTypes.PlaylistOrder,
    },
    {
      key: 'pt-artist-album-name',
      text: 'Artist, Album Name',
      value: SortTypes.ArtistThenAlbumName,
    },
    {
      key: 'pt-artist-album-date',
      text: 'Artist, Album Date',
      value: SortTypes.ArtistThenAlbumDate,
    },
    {
      key: 'pt-artist-track-name',
      text: 'Artist, Track Name',
      value: SortTypes.ArtistThenTrackName,
    },
    {
      key: 'pt-track-name',
      text: 'Track Name',
      value: SortTypes.TrackName,
    },
  ];

  const handleThemeChange = (e, { value }) => {
    setTheme(value);
  };

  const handleAlbumSortChange = (e, { value }) => {
    setAlbumSortOrder(value);
  };

  const handlePlaylistSortChange = (e, { value }) => {
    setPlaylistSortOrder(value);
  };

  const handleSavedTrackSortChange = (e, { value }) => {
    setSavedTrackSortOrder(value);
  };

  const handlePlaylistTrackSortChange = (e, { value }) => {
    setPlaylistTrackSortOrder(value);
  };

  const handleContextGridColumnsChange = (e) => {
    setGridColumns(e.target.value);
  };

  const handleLogOutSpotify = async () => {
    // kill the cookie
    document.cookie = 'spotify= ;max-age=0';
    console.log('handleLogOutSpotify - updated cookie', document.cookie);
    httpService
      .get(`/spotify/logout`)
      .then((response) => {
        console.log('handleLogOutSpotify logout response: ', response);
      })
      .catch((error) => console.log(error));
    const userAlbums = await getUserAlbums(
      contextSortType,
      genre,
      localFileData,
      httpService
    );
    setAlbumData({
      spotifyCount: savedAlbumData.spotifyCount,
      data: userAlbums,
    });
    setItem('');
    setRelatedTo('');
    resetListData();
    history.push('/');
  };

  const handleLogOutOneDrive = async () => {
    // kill the cookie
    document.cookie = 'oneDrive= ;max-age=0';
    console.log('handleLogOutOneDrive - updated cookie', document.cookie);
    httpService
      .get(`/one-drive/signout`)
      .then((response) => {
        console.log('handleLogOutOneDrive signout response: ', response);
      })
      .catch((error) => console.log(error));
    const userAlbums = await getUserAlbums(
      contextSortType,
      genre,
      localFileData,
      httpService
    );
    setAlbumData({
      spotifyCount: savedAlbumData.spotifyCount,
      data: userAlbums,
    });
    history.push('/');
  };

  const tabPanes = [
    {
      menuItem: 'General',
      render: () => (
        <Tab.Pane style={theme}>
          <div className="config-div" style={theme}>
            <strong>AlbumView Theme</strong>
            <Dropdown
              selection
              options={themeListOptions}
              value={albumViewTheme}
              onChange={handleThemeChange}
            />
          </div>
          <strong>Albums Per Row</strong>
          <span style={{ paddingLeft: '20px' }}>{contextGridColumns}</span>
          <div>
            <input
              type="range"
              min={3}
              max={10}
              value={contextGridColumns}
              onChange={handleContextGridColumnsChange}
            />
          </div>
          {isSpotifyAuthenticated && (
            <button className="spotify-button" onClick={handleLogOutSpotify}>
              Log Out Spotify
            </button>
          )}
          {!isSpotifyAuthenticated && (
            <a
              className="spotify-button"
              href={`${process.env.REACT_APP_SERVER_ROOT}/spotify/login`}
            >
              Connect to Spotify
            </a>
          )}
          {isOneDriveLoggedIn && (
            <button className="one-drive-button" onClick={handleLogOutOneDrive}>
              Log Out OneDrive
            </button>
          )}
          {!isOneDriveLoggedIn &&
          <a
            className="one-drive-button"
            href={`${process.env.REACT_APP_SERVER_ROOT}/one-drive/signin`}
          >
            Connect to OneDrive
          </a>
          }
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Sorting',
      render: () => (
        <Tab.Pane style={theme}>
          <div className="config-div" style={theme}>
            <strong>Album Sort</strong>
            <br />
            <Dropdown
              selection
              options={albumSortListOptions}
              value={albumSort}
              onChange={handleAlbumSortChange}
            />
          </div>
          <div className="config-div" style={theme}>
            <strong>Playlist Sort</strong>
            <br />
            <Dropdown
              selection
              options={playlistSortListOptions}
              value={playlistSort}
              onChange={handlePlaylistSortChange}
            />
          </div>
          <div className="config-div" style={theme}>
            <strong>Saved Track Sort</strong>
            <br />
            <Dropdown
              selection
              options={savedTrackSortListOptions}
              value={savedTrackSort}
              onChange={handleSavedTrackSortChange}
            />
          </div>
          <div className="config-div" style={theme}>
            <strong>Playlist Track Sort</strong>
            <br />
            <Dropdown
              selection
              options={playlistTrackSortListOptions}
              value={playlistTrackSort}
              onChange={handlePlaylistTrackSortChange}
            />
          </div>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <Modal size="mini" trigger={<Button icon="options" />} style={theme}>
      <Modal.Header style={theme}>Configuration Settings</Modal.Header>
      <Modal.Content style={theme}>
        <Tab
          style={theme}
          panes={tabPanes}
          menu={{
            attached: true,
            tabular: true,
            inverted: albumViewTheme === AlbumViewTheme.Dark,
          }}
        />
      </Modal.Content>
    </Modal>
  );
};

ModalConfig.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  isOneDriveLoggedIn: PropTypes.bool.isRequired,
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
  localFileData: PropTypes.any.isRequired,
  contextSortType: PropTypes.string.isRequired,
  genre: PropTypes.number.isRequired,
  albumViewTheme: PropTypes.string.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  albumSort: PropTypes.string.isRequired,
  playlistSort: PropTypes.string.isRequired,
  savedTrackSort: PropTypes.string.isRequired,
  playlistTrackSort: PropTypes.string.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setGridColumns: PropTypes.func.isRequired,
  setItem: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  resetListData: PropTypes.func.isRequired,
  setAlbumSortOrder: PropTypes.func.isRequired,
  setPlaylistSortOrder: PropTypes.func.isRequired,
  setSavedTrackSortOrder: PropTypes.func.isRequired,
  setPlaylistTrackSortOrder: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  isOneDriveLoggedIn: getOneDriveLoggedIn(state),
  savedAlbumData: getSavedAlbumData(state),
  localFileData: getLocalFileData(state),
  contextSortType: getContextSortType(state),
  genre: getSelectedGenre(state),
  albumViewTheme: getAlbumViewTheme(state),
  contextGridColumns: getContextGridColumns(state),
  albumSort: getAlbumSort(state),
  playlistSort: getPlaylistSort(state),
  savedTrackSort: getSavedTrackSort(state),
  playlistTrackSort: getPlaylistTrackSort(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setGridColumns: (columns) => dispatch(setContextGridColumns(columns)),
  setTheme: (theme) => dispatch(setAlbumViewTheme(theme)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  resetListData: () => dispatch(resetContextListData()),
  setAlbumSortOrder: (sort) => dispatch(setAlbumSort(sort)),
  setPlaylistSortOrder: (sort) => dispatch(setPlaylistSort(sort)),
  setSavedTrackSortOrder: (sort) => dispatch(setSavedTrackSort(sort)),
  setPlaylistTrackSortOrder: (sort) => dispatch(setPlaylistTrackSort(sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalConfig);
