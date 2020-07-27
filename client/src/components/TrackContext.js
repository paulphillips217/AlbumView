import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
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
  getContextGridData,
  getContextGridMore,
  getContextGridOffset,
  getContextSortType,
  getDataLoading,
  getSpotifyAuthenticationState,
} from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setDataLoading,
} from '../store/actions';
import { useTheme } from 'emotion-theming';
import SpotifyLogin from './SpotifyLogin';

const TrackContext = ({
  isSpotifyAuthenticated,
  dataLoading,
  contextGridData,
  contextGridOffset,
  contextGridMore,
  contextSortType,
  setContextGridData,
  setContextGridOffset,
  setContextGridMore,
  setDataLoading,
  httpService,
}) => {
  const theme = useTheme();
  const [contextData, setContextData] = useState({
    name: 'Your Saved Tracks',
    description: '',
  });

  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading || !isSpotifyAuthenticated) {
        return;
      }
      httpService
        .get(`/spotify/track-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((rawData) => {
          console.log('track data', rawData);
          const data = rawData.items.map((e) => ({
            trackName: e.track.name,
            albumId: e.track.album.id,
            albumName: e.track.album.name,
            artist: e.track.album.artists[0]
              ? e.track.album.artists[0].name
              : 'unknown artist',
            image: getImage(e.track.album.images),
            releaseDate: e.track.album.release_date,
          }));
          const newData = contextGridOffset
            ? contextGridData.concat(data)
            : data;
          setContextGridData(sortGridData(newData, contextSortType));
          setContextGridMore(!!rawData.next);
          if (!rawData.next) {
            setDataLoading(false);
          }
          setContextData({
            ...contextData,
            totalCount: rawData.total,
            loadingCount: contextGridOffset,
          });
        })
        .catch((error) => console.log(error));
    };
    getGridData();
  }, [contextGridOffset]);

  useEffect(() => {
    // get all the pages in the background
    if (
      dataLoading &&
      contextGridOffset < contextGridData.length &&
      contextGridMore
    ) {
      setContextGridOffset(contextGridData.length);
    }
  }, [dataLoading, contextGridData, contextGridOffset, contextGridMore]);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        {!isSpotifyAuthenticated && <SpotifyLogin />}
        {isSpotifyAuthenticated && (
          <ContextGrid
            contextGridData={contextGridData}
            httpService={httpService}
          />
        )}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

TrackContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  contextSortType: PropTypes.string.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyAuthenticationState(state),
  dataLoading: getDataLoading(state),
  contextGridColumns: getContextGridColumns(state),
  contextGridData: getContextGridData(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackContext);
