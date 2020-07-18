import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortGridData } from '../util/sortUtils';
import {
  getContextGridColumns,
  getSavedAlbumData,
  getSavedAlbumMore,
  getSavedAlbumOffset,
  getContextSortType,
  getDataLoading,
  getAuthenticationState,
} from '../store/selectors';
import {
  setSavedAlbumData,
  setSavedAlbumMore,
  setSavedAlbumOffset,
  setDataLoading,
} from '../store/actions';
import SpotifyLogin from './SpotifyLogin';

const AlbumContext = ({
  isAuthenticated,
  dataLoading,
  savedAlbumData,
  savedAlbumOffset,
  savedAlbumMore,
  contextSortType,
  setSavedAlbumData,
  setSavedAlbumOffset,
  setSavedAlbumMore,
  setDataLoading,
  httpService,
}) => {
  const theme = useTheme();

  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading) {
        return;
      }
      httpService
        .get(`/album-list/${savedAlbumOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((rawData) => {
          console.log('saved album data', rawData, savedAlbumOffset);
          const data = rawData.items.map((e) => ({
            trackId: '',
            trackName: '',
            albumId: e.album.id,
            albumName: e.album.name,
            artist: e.album.artists[0]
              ? e.album.artists[0].name
              : 'unknown artist',
            image: getImage(e.album.images),
            releaseDate: e.album.release_date,
          }));
          const newData = savedAlbumOffset ? savedAlbumData.concat(data) : data;
          setSavedAlbumData(sortGridData(newData, contextSortType));
          setSavedAlbumMore(!!rawData.next);
          if (!rawData.next) {
            setDataLoading(false);
          }
        })
        .catch((error) => console.log(error));
    };
    getGridData();
  }, [savedAlbumOffset]);

  useEffect(() => {
    // get all the pages in the background
    if (
      dataLoading &&
      savedAlbumOffset < savedAlbumData.length &&
      savedAlbumMore
    ) {
      setSavedAlbumOffset(savedAlbumData.length);
    }
  }, [dataLoading, savedAlbumData, savedAlbumOffset, savedAlbumMore]);

  const contextData = {
    name: 'Your Saved Albums',
    description: '',
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        {isAuthenticated && (
          <ContextGrid
            contextGridData={savedAlbumData}
            httpService={httpService}
          />
        )}
        {!isAuthenticated && <SpotifyLogin />}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

AlbumContext.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  savedAlbumData: PropTypes.array.isRequired,
  savedAlbumOffset: PropTypes.number.isRequired,
  savedAlbumMore: PropTypes.bool.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  contextSortType: PropTypes.string.isRequired,
  setSavedAlbumData: PropTypes.func.isRequired,
  setSavedAlbumOffset: PropTypes.func.isRequired,
  setSavedAlbumMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  dataLoading: getDataLoading(state),
  contextGridColumns: getContextGridColumns(state),
  savedAlbumData: getSavedAlbumData(state),
  savedAlbumOffset: getSavedAlbumOffset(state),
  savedAlbumMore: getSavedAlbumMore(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setSavedAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setSavedAlbumOffset: (offset) => dispatch(setSavedAlbumOffset(offset)),
  setSavedAlbumMore: (isMore) => dispatch(setSavedAlbumMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumContext);
