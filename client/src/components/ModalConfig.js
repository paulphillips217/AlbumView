import React from 'react';
import PropTypes from 'prop-types';
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
  setSpotifyAccessToken,
  setAlbumSort,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextGridData,
  setContextGridOffset,
  setContextItem,
  setContextListData,
  setContextListOffset,
  setContextType,
  setPlaylistSort,
  setPlaylistTrackSort,
  setSpotifyRefreshToken,
  setRelatedToArtist,
  setSavedTrackSort,
  setSpotifyTokenExpiration,
} from '../store/actions';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AlbumViewTheme, SortTypes } from '../store/types';
import { useTheme } from 'emotion-theming';

const ModalConfig = ({
  albumViewTheme,
  contextGridColumns,
  albumSort,
  playlistSort,
  savedTrackSort,
  playlistTrackSort,
  setSpotifyAccessToken,
  setSpotifyRefreshToken,
  setSpotifyTokenExpiration,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextItem,
  setContextType,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
  setAlbumSort,
  setPlaylistSort,
  setSavedTrackSort,
  setPlaylistTrackSort,
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
    setAlbumViewTheme(value);
  };

  const handleAlbumSortChange = (e, { value }) => {
    setAlbumSort(value);
  };

  const handlePlaylistSortChange = (e, { value }) => {
    setPlaylistSort(value);
  };

  const handleSavedTrackSortChange = (e, { value }) => {
    setSavedTrackSort(value);
  };

  const handlePlaylistTrackSortChange = (e, { value }) => {
    setPlaylistTrackSort(value);
  };

  const handleContextGridColumnsChange = (e) => {
    setContextGridColumns(e.target.value);
  };

  const handleLogOut = () => {
    setSpotifyRefreshToken('');
    setSpotifyAccessToken('');
    setSpotifyTokenExpiration('');
    setContextItem('');
    setContextType('');
    setRelatedToArtist('');
    setContextGridData([]);
    setContextGridOffset(0);
    setContextListData([]);
    setContextListOffset(0);
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
          <Button onClick={handleLogOut}>Log Out</Button>
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
    <Modal size={'mini'} trigger={<Button icon="options" />} style={theme}>
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
  setSpotifyAccessToken: PropTypes.func.isRequired,
  setContextGridColumns: PropTypes.func.isRequired,
  setSpotifyRefreshToken: PropTypes.func.isRequired,
  setSpotifyTokenExpiration: PropTypes.func.isRequired,
  setContextType: PropTypes.func.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setAlbumViewTheme: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
  setAlbumSort: PropTypes.func.isRequired,
  setPlaylistSort: PropTypes.func.isRequired,
  setSavedTrackSort: PropTypes.func.isRequired,
  setPlaylistTrackSort: PropTypes.func.isRequired,
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
  setSpotifyAccessToken: (accessToken) => dispatch(setSpotifyAccessToken(accessToken)),
  setContextGridColumns: (columns) => dispatch(setContextGridColumns(columns)),
  setSpotifyRefreshToken: (refreshToken) => dispatch(setSpotifyRefreshToken(refreshToken)),
  setSpotifyTokenExpiration: (expiration) => dispatch(setSpotifyTokenExpiration(expiration)),
  setAlbumViewTheme: (theme) => dispatch(setAlbumViewTheme(theme)),
  setContextType: (type) => dispatch(setContextType(type)),
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
  setAlbumSort: (sort) => dispatch(setAlbumSort(sort)),
  setPlaylistSort: (sort) => dispatch(setPlaylistSort(sort)),
  setSavedTrackSort: (sort) => dispatch(setSavedTrackSort(sort)),
  setPlaylistTrackSort: (sort) => dispatch(setPlaylistTrackSort(sort)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalConfig);
