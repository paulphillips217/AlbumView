import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Dropdown,
  Grid,
  Segment,
} from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { ContextType } from '../store/types';
import {
  setContextType,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
  setContextItem,
  setRelatedToArtist,
} from '../store/actions';
import {
  getContextItem,
  getContextType,
} from '../store/selectors';
import ModalConfig from './ModalConfig';

const AlbumViewHeader = ({
  contextType,
  contextItem,
  setContextItem,
  setContextType,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextListData,
  setContextListOffset,
  httpService,
}) => {
  const theme = useTheme();
  const [contextData, setContextData] = useState({ name: '', description: '' });
  console.log('albumViewHeader theme: ', theme);

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
        case ContextType.RelatedArtists:
          setContextData({
            name: 'Related Artists',
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
    {
      key: 'related-artist-key',
      text: 'Related Artists',
      value: ContextType.RelatedArtists,
    },
  ];

  const handleDropdownChange = (e, { value }) => {
    setContextGridOffset(0);
    setContextListOffset(0);
    setContextGridData([]);
    setContextListData([]);
    setContextType(value);
    setContextItem('');
    setRelatedToArtist('');
    console.log('handle dropdown change', value);
  };

  const createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  return (
    <Card fluid style={theme}>
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
            <ModalConfig />
          </Segment>
        </Grid.Column>
      </Grid>
    </Card>
  );
};

AlbumViewHeader.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextType: PropTypes.func.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextItem: getContextItem(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextType: (type) => dispatch(setContextType(type)),
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumViewHeader);
