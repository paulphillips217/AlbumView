import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Dropdown, Grid, Segment } from 'semantic-ui-react';
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
  setDataLoading,
  setContextGridMore,
  setContextListMore,
} from '../store/actions';
import { getContextType, getDataLoading } from '../store/selectors';
import ModalConfig from './ModalConfig';

const AlbumViewHeader = ({
  contextType,
  contextData,
  dataLoading,
  setContextItem,
  setDataLoading,
  setContextType,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextGridMore,
  setContextListData,
  setContextListOffset,
  setContextListMore,
}) => {
  const theme = useTheme();

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
    {
      key: 'local-file-key',
      text: 'Local Files',
      value: ContextType.LocalFiles,
    },
    {
      key: 'one-drive-file-key',
      text: 'OneDrive Files',
      value: ContextType.OneDriveFiles,
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
    setContextGridMore(true);
    setContextListMore(true);
    setDataLoading(true);
    console.log('handle dropdown change', value);
  };

  const handleCancelLoading = () => {
    console.log('cancelling loading from header');
    setDataLoading(false);
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
              value={contextType}
              onChange={handleDropdownChange}
            />
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment basic textAlign="center">
            {' '}
          </Segment>
        </Grid.Column>
        <Grid.Column width={7}>
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
            {dataLoading && (
              <Button onClick={handleCancelLoading}>
                Loading
                <br />
                (click to cancel)
              </Button>
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
  contextData: PropTypes.object.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  setContextType: PropTypes.func.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
  setContextListMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  dataLoading: getDataLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextType: (type) => dispatch(setContextType(type)),
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
  setContextListMore: (isMore) => dispatch(setContextListMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumViewHeader);
