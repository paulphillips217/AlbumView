import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import { SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortGridData } from '../util/sortUtils';
import {
  getContextGridData,
  getContextSortType,
  getDataLoading,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import { setContextGridData, setDataLoading } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';

const TrackContext = ({
  isSpotifyAuthenticated,
  dataLoading,
  contextGridData,
  contextSortType,
  setGridData,
  setLoading,
  httpService,
}) => {
  const theme = useTheme();

  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading || !isSpotifyAuthenticated) {
        return;
      }
      const offset = contextGridData.data.length;
      httpService
        .get(`/spotify/track-list/${offset}/${SPOTIFY_PAGE_LIMIT}`)
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
          const newData = contextGridData.data.concat(data);
          setGridData({
            spotifyCount: rawData.total,
            data: sortGridData(newData, contextSortType),
          });
          if (!rawData.next) {
            setLoading(false);
          }
        })
        .catch((error) => console.log(error));
    };
    getGridData();
  }, [
    contextGridData,
    contextSortType,
    dataLoading,
    httpService,
    isSpotifyAuthenticated,
    setGridData,
    setLoading,
  ]);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader
          contextData={{
            name: 'Your Saved Tracks',
            description: '',
            spotifyCount: contextGridData.spotifyCount,
            loadingCount: contextGridData.data.length,
          }}
          httpService={httpService}
        />
      </div>
      <div className="row content">
        {!isSpotifyAuthenticated && <SpotifyLogin />}
        {isSpotifyAuthenticated && (
          <ContextGrid contextGridData={contextGridData} httpService={httpService} />
        )}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

TrackContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.string,
      })
    ),
  }).isRequired,
  contextSortType: PropTypes.string.isRequired,
  setGridData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  dataLoading: getDataLoading(state),
  contextGridData: getContextGridData(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setGridData: (data) => dispatch(setContextGridData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackContext);
