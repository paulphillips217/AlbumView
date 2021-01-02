import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Card, Dropdown, Grid, Progress, Segment } from 'semantic-ui-react';
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
  setSelectedGenre,
  setAlbumJobId,
} from '../store/actions';
import {
  getAlbumJobId,
  getContextType,
  getDataLoading,
  getSelectedGenre,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import ModalConfig from './ModalConfig';
import HttpService from '../util/httpUtils';
import { useInterval } from '../util/useInterval';

const AlbumViewHeader = ({
  isSpotifyAuthenticated,
  contextType,
  contextData,
  dataLoading,
  genre,
  jobId,
  setItem,
  setLoading,
  setType,
  setRelatedTo,
  setGridData,
  resetListData,
  setGenre,
  setJobId,
  httpService,
}) => {
  const theme = useTheme();
  const [jobProgress, setJobProgress] = useState(-1);
  const [genreOptions, setGenreOptions] = useState([
    {
      key: 0,
      text: 'All Genres',
      value: 0,
    },
  ]);

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

  useEffect(() => {
    const getGenreList = () => {
      if (!isSpotifyAuthenticated) {
        return;
      }
      httpService
        .get(`/album-view/genre-list`)
        .then((rawData) => {
          // console.log('genre list raw data: ', rawData);
          // .filter((item) => item.albumCount >= 200)
          const data = rawData.map((item) => ({
            key: item.genreId,
            text: item.genreName,
            value: item.genreId,
          }));
          setGenreOptions([
            {
              key: 0,
              text: 'All Genres',
              value: 0,
            },
            ...data,
          ]);
          //console.log('genre list processed:', genreOptions);
        })
        .catch((error) => console.log(error));
    };
    getGenreList();
  }, [isSpotifyAuthenticated, httpService]);

  const getAlbumJobProgress = () => {
    if (
      !isSpotifyAuthenticated ||
      contextType !== ContextType.Albums ||
      jobId <= 0 ||
      jobProgress >= 100
    ) {
      return;
    }
    httpService
      .get(`/album-view/job-progress/${jobId}`)
      .then((jobData) => {
        console.log('getAlbumJobProgress: ', jobId, jobData);
        setJobProgress(jobData.progress);
        if (jobData.progress >= 100) {
          setJobId(-1);
        }
      })
      .catch((error) => console.log(error));
  };
  useInterval(getAlbumJobProgress, 1000);

  const handleContextChange = (e, { value }) => {
    setGridData({ spotifyCount: 0, offset: 0, data: [] });
    resetListData();
    setType(value);
    setItem('');
    setRelatedTo('');
    setLoading(true);
    console.log('handle dropdown change', value);
  };

  const handleGenreChange = (e, { value }) => {
    setGenre(value);
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
              onChange={handleContextChange}
            />
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment basic textAlign="center">
            {contextType === ContextType.Albums && (
              <Dropdown
                inline
                scrolling
                options={genreOptions}
                value={genre}
                onChange={handleGenreChange}
              />
            )}
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
            {dataLoading && contextType !== ContextType.Albums && (
              <Button onClick={handleCancelLoading}>
                {loadingButtonText}
                <br />
                (click to cancel)
              </Button>
            )}
            {contextType === ContextType.Albums &&
              jobProgress > 0 &&
              jobProgress < 100 && (
                <Progress percent={jobProgress} progress />
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
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  contextType: PropTypes.string.isRequired,
  contextData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    spotifyCount: PropTypes.number,
    loadingCount: PropTypes.number,
  }).isRequired,
  dataLoading: PropTypes.bool.isRequired,
  genre: PropTypes.number.isRequired,
  jobId: PropTypes.number.isRequired,
  setType: PropTypes.func.isRequired,
  setItem: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  resetListData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setGenre: PropTypes.func.isRequired,
  setJobId: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  contextType: getContextType(state),
  dataLoading: getDataLoading(state),
  genre: getSelectedGenre(state),
  jobId: getAlbumJobId(state),
});

const mapDispatchToProps = (dispatch) => ({
  setType: (type) => dispatch(setContextType(type)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  resetListData: () => dispatch(resetContextListData()),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
  setGenre: (id) => dispatch(setSelectedGenre(id)),
  setJobId: (data) => dispatch(setAlbumJobId(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumViewHeader);
