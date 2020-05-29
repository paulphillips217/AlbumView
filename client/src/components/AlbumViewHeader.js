import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Button, Dropdown, Grid, Segment } from 'semantic-ui-react';
import { ContextType } from '../store/types';
import {
  setAccessToken,
  setRefreshToken,
  setContextType,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
} from '../store/actions';
import httpService from '../util/httpUtils';
import { getContextItem, getContextType } from '../store/selectors';
import '../styles/App.css';

const AlbumViewHeader = ({
  contextType,
  contextItem,
  setAccessToken,
  setRefreshToken,
  setContextType,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
  httpService,
}) => {
  const history = useHistory();
  const [contextData, setContextData] = useState({ name: '', description: '' });

  useEffect(() => {
    const getContextData = () => {
      switch (contextType) {
        case ContextType.Albums:
          setContextData({
            name: 'Your Saved Albums',
            description: '',
          });
          break;
        case ContextType.Tracks:
          setContextData({
            name: 'Your Saved Tracks',
            description: '',
          });
          break;
        case ContextType.Artists:
          setContextData({
            name: 'Your Saved Artists',
            description: '',
          });
          break;
        case ContextType.Playlists:
          if (contextItem) {
            httpService
              .get(`/playlist-data/${contextItem}`)
              .then((data) => {
                setContextData({
                  name: data.name,
                  description: data.description,
                });
              })
              .catch((error) => console.log(error));
          } else {
            setContextData({
              name: 'Please Select a Playlist',
              description: '',
            });
          }
          break;
        default:
          console.log(
            'unknown context type in Header.getContextData',
            contextType
          );
      }
    };
    getContextData();
  }, [contextType, contextItem, httpService]);

  const listOptions = [
    {
      key: 'saved-album-key',
      text: 'Your Saved Albums',
      value: ContextType.Albums,
    },
    {
      key: 'saved-track-key',
      text: 'Your Saved Tracks',
      value: ContextType.Tracks,
    },
    {
      key: 'saved-artist-key',
      text: 'Your Saved Artists',
      value: ContextType.Artists,
    },
    {
      key: 'playlists-key',
      text: 'Your Spotify Playlists',
      value: ContextType.Playlists,
    },
  ];

  const handleDropdownChange = (e, { value }) => {
    setContextType(value);
    setContextGridData([]);
    setContextGridOffset(0);
    setContextListData([]);
    setContextListOffset(0);
    console.log('handle dropdown change', value);
  };

  const handleLogOut = () => {
    setRefreshToken('');
    setAccessToken('');
    setContextGridData([]);
    setContextGridOffset(0);
    setContextListData([]);
    setContextListOffset(0);
    history.push('/auth');
  };

  const createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  return (
    <Card fluid>
      <Grid columns="equal">
        <Grid.Column>
          <Segment basic textAlign="center">
            <Dropdown
              inline
              options={listOptions}
              defaultValue={contextType}
              onChange={handleDropdownChange}
            />
          </Segment>
        </Grid.Column>
        <Grid.Column width={8}>
          <Segment basic textAlign="center">
            <h1>{contextData.name}</h1>
            {contextData.description && (
              <p
                dangerouslySetInnerHTML={createDescriptionMarkup(
                  contextData.description
                )}
              />
            )}
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment basic textAlign="center">
            <Button onClick={handleLogOut}>Log Out</Button>
          </Segment>
        </Grid.Column>
      </Grid>
    </Card>
  );
};

AlbumViewHeader.propTypes = {
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
  setContextType: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextItem: getContextItem(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
  setContextType: (type) => dispatch(setContextType(type)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
});

const mergeProps = (stateProps, dispatchProps, props) => ({
  ...props,
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(AlbumViewHeader);
