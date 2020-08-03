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
  resetContextListData,
  setContextItem,
  setRelatedToArtist,
  setDataLoading,
} from '../store/actions';
import { getContextType, getDataLoading } from '../store/selectors';
import ModalConfig from './ModalConfig';

const AlbumViewHeader = ({
  contextType,
  contextData,
  dataLoading,
  setItem,
  setLoading,
  setType,
  setRelatedTo,
  setGridData,
  resetListData,
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
    setGridData({ spotifyCount: 0, offset: 0, data: [] });
    resetListData();
    setType(value);
    setItem('');
    setRelatedTo('');
    setLoading(true);
    console.log('handle dropdown change', value);
  };

  const handleCancelLoading = () => {
    console.log('cancelling loading from header');
    setLoading(false);
  };

  const createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  const loadingButtonText = contextData.spotifyCount
    ? `Loading ${contextData.loadingCount} of ${contextData.spotifyCount}`
    : 'Loading';

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
                /* eslint-disable no-alert, react/no-danger */
                dangerouslySetInnerHTML={createDescriptionMarkup(contextData.description)}
                /* eslint-disable no-alert, react/no-danger */
              />
            )}
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment basic textAlign="center">
            {dataLoading && (
              <Button onClick={handleCancelLoading}>
                {loadingButtonText}
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
  contextData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    spotifyCount: PropTypes.number,
    loadingCount: PropTypes.number,
  }).isRequired,
  dataLoading: PropTypes.bool.isRequired,
  setType: PropTypes.func.isRequired,
  setItem: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  resetListData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  dataLoading: getDataLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  setType: (type) => dispatch(setContextType(type)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  resetListData: () => dispatch(resetContextListData()),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumViewHeader);
