import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import {
  getSavedAlbumData,
  getContextSortType,
  getSelectedGenre,
  getLocalFileData,
  getAlbumJobId,
  getAlbumViewIsAuthenticated,
} from '../store/selectors';
import { setSavedAlbumData, setAlbumJobId } from '../store/actions';
import HttpService from '../util/httpUtils';
import { getUserAlbums } from '../util/utilities';
import SpotifyLogin from './SpotifyLogin';

const AlbumContext = ({
  isAlbumViewAuthenticated,
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
    if (isAlbumViewAuthenticated) {
      const userAlbums = await getUserAlbums(
        contextSortType,
        genre,
        localFileData,
        httpService
      );
      setAlbumData({
        spotifyCount: savedAlbumData.spotifyCount,
        data: userAlbums,
      });
    }
  }, [
    isAlbumViewAuthenticated,
    contextSortType,
    genre,
    httpService,
    setAlbumData,
    localFileData,
    savedAlbumData.spotifyCount,
  ]);

  useEffect(() => {
    getGridData();
  }, [getGridData]);

  useEffect(() => {
    // AlbumViewHeader will set jobId to -1 to let us know the worker job finished
    if (jobId === -1) {
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
        {savedAlbumData.data.length === 0 && <SpotifyLogin />}
        <ContextGrid contextGridData={savedAlbumData} httpService={httpService} />
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

AlbumContext.propTypes = {
  isAlbumViewAuthenticated: PropTypes.bool.isRequired,
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
  isAlbumViewAuthenticated: getAlbumViewIsAuthenticated(state),
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
