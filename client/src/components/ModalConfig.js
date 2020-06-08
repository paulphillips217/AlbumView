import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown, Modal } from 'semantic-ui-react';
import { getAlbumViewTheme, getContextItem } from '../store/selectors';
import {
  setAccessToken,
  setAlbumViewTheme,
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
import { AlbumViewTheme, ContextType } from '../store/types';

const ModalConfig = ({
  albumViewTheme,
  setAccessToken,
  setRefreshToken,
  setTokenExpiration,
  setAlbumViewTheme,
  setContextItem,
  setContextType,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
}) => {
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
    console.log('handle dropdown change', value);
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
    <Modal size={'mini'} trigger={<Button icon="options" />}>
      <Modal.Header>Album View Configuration Settings</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <div className='config-div'>
            <strong>AlbumView Theme </strong>
            <Dropdown
              selection
              options={listOptions}
              defaultValue={albumViewTheme}
              onChange={handleDropdownChange}
            />
          </div>
          <Button onClick={handleLogOut}>Log Out</Button>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalConfig.propTypes = {
  setAccessToken: PropTypes.func.isRequired,
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
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
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
