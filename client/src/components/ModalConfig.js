import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Modal } from 'semantic-ui-react';
import { getAlbumViewTheme, getContextGridColumns } from '../store/selectors';
import {
  setAccessToken,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextGridData,
  setContextGridOffset,
  setContextItem,
  setContextListData,
  setContextListOffset,
  setContextType,
  setRefreshToken,
  setRelatedToArtist,
  setTokenExpiration,
} from '../store/actions';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AlbumViewTheme } from '../store/types';
import { useTheme } from 'emotion-theming';

const ModalConfig = ({
  albumViewTheme,
  contextGridColumns,
  setAccessToken,
  setRefreshToken,
  setTokenExpiration,
  setAlbumViewTheme,
  setContextGridColumns,
  setContextItem,
  setContextType,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
}) => {
  const theme = useTheme();
  const history = useHistory();

  const listOptions = [
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

  const handleDropdownChange = (e, { value }) => {
    setAlbumViewTheme(value);
  };

  const handleContextGridColumnsChange = (e) => {
    setContextGridColumns(e.target.value);
  };

  const handleLogOut = () => {
    setRefreshToken('');
    setAccessToken('');
    setTokenExpiration('');
    setContextItem('');
    setContextType('');
    setRelatedToArtist('');
    setContextGridData([]);
    setContextGridOffset(0);
    setContextListData([]);
    setContextListOffset(0);
    history.push('/');
  };

  return (
    <Modal size={'mini'} trigger={<Button icon="options" />} style={theme}>
      <Modal.Header style={theme}>
        Album View Configuration Settings
      </Modal.Header>
      <Modal.Content style={theme}>
        <Modal.Description>
          <div className="config-div" style={theme}>
            <strong>AlbumView Theme</strong>
            <Dropdown
              selection
              options={listOptions}
              defaultValue={albumViewTheme}
              onChange={handleDropdownChange}
            />
          </div>
          <strong>Albums Per Row</strong>
          <span style={{paddingLeft: '20px'}}>{contextGridColumns}</span>
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
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalConfig.propTypes = {
  albumViewTheme: PropTypes.string.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  setAccessToken: PropTypes.func.isRequired,
  setContextGridColumns: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
  setTokenExpiration: PropTypes.func.isRequired,
  setContextType: PropTypes.func.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setAlbumViewTheme: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  albumViewTheme: getAlbumViewTheme(state),
  contextGridColumns: getContextGridColumns(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setContextGridColumns: (columns) => dispatch(setContextGridColumns(columns)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
  setTokenExpiration: (expiration) => dispatch(setTokenExpiration(expiration)),
  setAlbumViewTheme: (theme) => dispatch(setAlbumViewTheme(theme)),
  setContextType: (type) => dispatch(setContextType(type)),
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalConfig);
