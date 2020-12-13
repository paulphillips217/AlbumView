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
  getDataLoading,
  getSpotifyIsAuthenticated,
  getSelectedGenre,
} from '../store/selectors';
import { setSavedAlbumData, setDataLoading } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';
import { blendAlbumLists } from '../util/localFileUtils';

const AlbumContext = ({
  isSpotifyAuthenticated,
  dataLoading,
  savedAlbumData,
  contextSortType,
  genre,
  setAlbumData,
  setLoading,
  httpService,
}) => {
  const theme = useTheme();

  const getGridData = useCallback(async () => {
    let spotifyCount = savedAlbumData.spotifyCount;
    if (!isSpotifyAuthenticated) {
      console.log('albumContext getGridData - not logged in');
      setLoading(false);
      return;
    }
    if (spotifyCount < 0) {
      console.log('albumContext getGridData - refreshing saved album data');
      const data = await httpService.get(`/spotify/album-list-refresh`);
      console.log('saved album data refreshed: ', data);
      spotifyCount = data.count;
    }
    console.log('albumContext getGridData - fetching data');
    try {
      const rawData = await httpService.get(`/spotify/album-list-fetch/${genre}`);
      // console.log('albumContext saved album data', rawData);
      const data = rawData.map((item) => ({
        albumId: item.albumId,
        spotifyAlbumId: item.spotifyAlbumId ? item.spotifyAlbumId : '',
        localId: item.localId ? item.localId : 0,
        oneDriveId: item.oneDriveId ? item.oneDriveId : '',
        albumName: item.albumName ? item.albumName : 'unknown album',
        artistName: item.artistName ? item.artistName : 'unknown artist',
        image: item.imageUrl,
        releaseDate: item.releaseDate ? moment(item.releaseDate).valueOf()  : Date.now(),
      }));
      if (data.length >= spotifyCount) {
        console.log(
          'albumContext getGridData setting loading false',
          data.length,
          spotifyCount
        );
        setLoading(false);
      }
      console.log('albumContext just before blending', data);
      blendAlbumLists(
        data,
        'albumId',
        savedAlbumData,
        spotifyCount,
        contextSortType,
        setAlbumData
      );
    } catch (err) {
      console.error(err);
    }
  }, [
    contextSortType,
    genre,
    httpService,
    isSpotifyAuthenticated,
    setAlbumData,
    setLoading,
  ]);

  useEffect(() => {
    getGridData();
  }, [genre, getGridData]);

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
  dataLoading: PropTypes.bool.isRequired,
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
  contextSortType: PropTypes.string.isRequired,
  genre: PropTypes.number.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  dataLoading: getDataLoading(state),
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
  genre: getSelectedGenre(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumContext);
