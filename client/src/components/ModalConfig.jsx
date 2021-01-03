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
  getPlaylistSort,
  getPlaylistTrackSort,
  getSavedTrackSort,
} from '../store/selectors';
import {
  setAlbumSort,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextGridData,
  setContextItem,
  resetContextListData,
  setPlaylistSort,
  setPlaylistTrackSort,
  setRelatedToArtist,
  setSavedTrackSort,
} from '../store/actions';
import { AlbumViewTheme, SortTypes } from '../store/types';
import HttpService from '../util/httpUtils';
import '../styles/App.css';

const ModalConfig = ({
  albumViewTheme,
  contextGridColumns,
  albumSort,
  playlistSort,
  savedTrackSort,
  playlistTrackSort,
  setTheme,
  setGridColumns,
  setItem,
  setRelatedTo,
  setGridData,
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

  const handleLogOutSpotify = () => {
    // kill the cookie
    document.cookie = 'spotify= ;max-age=0';
    console.log('handleLogOutSpotify - updated cookie', document.cookie);
    httpService
      .get(`/spotify/logout`)
      .then((response) => {
        console.log('handleLogOutSpotify logout response: ', response);
      })
      .catch((error) => console.log(error));
    setItem('');
    setRelatedTo('');
    setGridData({ spotifyCount: 0, data: [] });
    resetListData();
    history.push('/');
  };

  const handleLogOutOneDrive = () => {
    // kill the cookie
    document.cookie = 'oneDrive= ;max-age=0';
    console.log('handleLogOutOneDrive - updated cookie', document.cookie);
    httpService
      .get(`/one-drive/signout`)
      .then((response) => {
        console.log('handleLogOutOneDrive signout response: ', response);
      })
      .catch((error) => console.log(error));
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
          <button className="spotify-button" onClick={handleLogOutSpotify}>
            Log Out Spotify
          </button>
          <button className="one-drive-button" onClick={handleLogOutOneDrive}>
            Log Out OneDrive
          </button>
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
  albumViewTheme: PropTypes.string.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  albumSort: PropTypes.string.isRequired,
  playlistSort: PropTypes.string.isRequired,
  savedTrackSort: PropTypes.string.isRequired,
  playlistTrackSort: PropTypes.string.isRequired,
  setGridColumns: PropTypes.func.isRequired,
  setItem: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  resetListData: PropTypes.func.isRequired,
  setAlbumSortOrder: PropTypes.func.isRequired,
  setPlaylistSortOrder: PropTypes.func.isRequired,
  setSavedTrackSortOrder: PropTypes.func.isRequired,
  setPlaylistTrackSortOrder: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  albumViewTheme: getAlbumViewTheme(state),
  contextGridColumns: getContextGridColumns(state),
  albumSort: getAlbumSort(state),
  playlistSort: getPlaylistSort(state),
  savedTrackSort: getSavedTrackSort(state),
  playlistTrackSort: getPlaylistTrackSort(state),
});

const mapDispatchToProps = (dispatch) => ({
  setGridColumns: (columns) => dispatch(setContextGridColumns(columns)),
  setTheme: (theme) => dispatch(setAlbumViewTheme(theme)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  resetListData: () => dispatch(resetContextListData()),
  setAlbumSortOrder: (sort) => dispatch(setAlbumSort(sort)),
  setPlaylistSortOrder: (sort) => dispatch(setPlaylistSort(sort)),
  setSavedTrackSortOrder: (sort) => dispatch(setSavedTrackSort(sort)),
  setPlaylistTrackSortOrder: (sort) => dispatch(setPlaylistTrackSort(sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalConfig);
