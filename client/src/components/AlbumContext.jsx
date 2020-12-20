import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import {
  getSavedAlbumData,
  getContextSortType,
  getSpotifyIsAuthenticated,
  getSelectedGenre,
  getLocalFileData, getAlbumJobId
} from '../store/selectors';
import { setSavedAlbumData, setAlbumJobId } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';
import { createLocalAlbumTracks } from '../util/localFileUtils';
import { sortGridData } from '../util/sortUtils';

const AlbumContext = ({
  isSpotifyAuthenticated,
  savedAlbumData,
  localFileData,
  contextSortType,
  genre,
  jobId,
  setAlbumData,
  setJobId,
  httpService,
}) => {
  const theme = useTheme();

  const getGridData = useCallback(async () => {
    let spotifyCount = savedAlbumData.spotifyCount;
    if (!isSpotifyAuthenticated) {
      console.log('albumContext getGridData - not logged in');
      return;
    }
    if (spotifyCount < 0) {
      console.log('albumContext getGridData - refreshing saved album data');
      const data = await httpService.get(`/spotify/album-list-refresh`);
      console.log('saved album data refreshed: ', data);
      spotifyCount = data.count;
      setJobId(parseInt(data.jobId));
    }
    console.log('albumContext getGridData - fetching data');
    try {
      const rawData = await httpService.get(`/spotify/album-list-fetch/${genre}`);
      // console.log('albumContext saved album data', rawData);
      const theAlbumArray = createLocalAlbumTracks(localFileData);
      console.log('AlbumContext.getGridData got theAlbumArray', theAlbumArray);
      const data = rawData.map((item) => ({
        albumId: item.albumId,
        spotifyAlbumId: item.spotifyAlbumId ? item.spotifyAlbumId : '',
        localId: item.localId ? item.localId : 0,
        oneDriveId: item.oneDriveId ? item.oneDriveId : '',
        albumName: item.albumName ? item.albumName : 'unknown album',
        artistName: item.artistName ? item.artistName : 'unknown artist',
        image: item.imageUrl,
        releaseDate: item.releaseDate ? moment(item.releaseDate).valueOf() : Date.now(),
        tracks: theAlbumArray.find((a) => a.localId === item.localId)?.tracks,
      }));
      const sortedData = sortGridData(data, contextSortType);
      setAlbumData({
        spotifyCount: spotifyCount,
        data: sortedData,
      });
    } catch (err) {
      console.error(err);
    }
  }, [
    contextSortType,
    genre,
    httpService,
    isSpotifyAuthenticated,
    setAlbumData,
    setJobId,
    localFileData,
    savedAlbumData.spotifyCount,
  ]);

  useEffect(() => {
    getGridData();
  }, [genre, getGridData]);

  useEffect(() => {
    // AlbumViewHeader will set jobId to -1 to let us know the worker job finished
    if (jobId === -1){
      console.log('AlbumContext refreshing grid on worker completion');
      getGridData();
      setJobId(0);
    }
  }, [jobId, setJobId, getGridData]);

  const contextData = {
    name: 'Your Saved Albums',
    description: '',
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader
          contextData={{
            ...contextData,
            spotifyCount: savedAlbumData.spotifyCount,
            loadingCount: 9999,
          }}
          httpService={httpService}
        />
      </div>
      <div className="row content">
        {isSpotifyAuthenticated && (
          <ContextGrid contextGridData={savedAlbumData} httpService={httpService} />
        )}
        {!isSpotifyAuthenticated && <SpotifyLogin />}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

AlbumContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
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
  jobId: PropTypes.number.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setJobId: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  savedAlbumData: getSavedAlbumData(state),
  localFileData: getLocalFileData(state),
  contextSortType: getContextSortType(state),
  genre: getSelectedGenre(state),
  jobId: getAlbumJobId(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setJobId: (data) => dispatch(setAlbumJobId(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumContext);
