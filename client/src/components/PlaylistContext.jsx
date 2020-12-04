import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextList from './ContextList';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import { SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortGridData } from '../util/sortUtils';
import {
  getContextGridData,
  getContextItem,
  getContextListData,
  getContextSortType,
  getDataLoading,
  getPlaylistSort,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import { setContextGridData, setContextListData, setDataLoading } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';

const PlaylistContext = ({
  isSpotifyAuthenticated,
  contextItem,
  dataLoading,
  contextGridData,
  contextSortType,
  contextListData,
  playlistSortType,
  setGridData,
  setListData,
  setLoading,
  httpService,
}) => {
  const theme = useTheme();
  const [contextData, setContextData] = useState({
    name: 'Please Select a Playlist',
    description: '',
  });
  const [loadingState, setLoadingState] = useState({ spotifyCount: 0, loadingCount: 0 });

  // load grid
  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading || !isSpotifyAuthenticated) {
        return;
      }
      if (contextItem) {
        const offset = contextGridData.data.length;
        httpService
          .get(`/spotify/playlist-tracks/${contextItem}/${offset}/${SPOTIFY_PAGE_LIMIT}`)
          .then((rawData) => {
            const data = rawData.items.map((e) => ({
              trackName: e.track.name,
              albumId: e.track.album.id,
              albumName: e.track.album.name,
              artist: e.track.album.artists[0]
                ? e.track.album.artists[0].name
                : 'unknown artist',
              image: getImage(e.track.album.images),
              releaseDate: e.track.album.release_date ? e.track.album.release_date : Date.now(),
            }));
            const newData = contextGridData.data.concat(data);
            setGridData({
              spotifyCount: rawData.total,
              data: sortGridData(newData, contextSortType),
            });
            if (!rawData.next) {
              setLoading(false);
            }
            setLoadingState({
              spotifyCount: contextGridData.spotifyCount,
              loadingCount: contextGridData.data.length,
            });
          })
          .catch((error) => console.log(error));
      }
    };
    getGridData();
  }, [
    isSpotifyAuthenticated,
    contextItem,
    contextGridData,
    contextSortType,
    dataLoading,
    setGridData,
    setLoading,
    httpService,
  ]);

  // load playlist list
  useEffect(() => {
    const getList = () => {
      if (!isSpotifyAuthenticated || !dataLoading) {
        return;
      }
      const offset = contextListData.data.length;
      if (contextListData.spotifyCount < 0 || offset < contextListData.spotifyCount) {
        httpService
          .get(`/spotify/playlist-list/${offset}/${SPOTIFY_PAGE_LIMIT}`)
          .then((data) => {
            const parsedData = data.items.map((e) => ({
              id: e.id,
              name: e.name,
              author: e.owner.display_name,
              description: e.description,
              image: getImage(e.images),
            }));
            const newData = contextListData.data.concat(parsedData);
            setListData({
              spotifyCount: data.total,
              data: sortGridData(newData, playlistSortType),
            });
            if (!data.next) {
              setLoading(false);
            }
            setLoadingState({
              spotifyCount: Math.max(contextListData.spotifyCount, 0),
              loadingCount: contextListData.data.length,
            });
          })
          .catch((error) => console.log(error));
      }
    };
    getList();
  }, [
    isSpotifyAuthenticated,
    dataLoading,
    contextListData,
    playlistSortType,
    setListData,
    setLoading,
    httpService,
  ]);

  // load context for header
  useEffect(() => {
    const getContextData = () => {
      if (isSpotifyAuthenticated && contextItem) {
        httpService
          .get(`/spotify/playlist-data/${contextItem}`)
          .then((data) => {
            setContextData({
              name: data.name,
              description: data.description,
            });
          })
          .catch((error) => console.log(error));
      }
    };
    getContextData();
  }, [isSpotifyAuthenticated, contextItem, httpService]);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader
          contextData={{
            ...contextData,
            ...loadingState,
          }}
          httpService={httpService}
        />
      </div>
      <div className="row content">
        {!isSpotifyAuthenticated && <SpotifyLogin />}
        {isSpotifyAuthenticated && (
          <SplitPane
            split="vertical"
            minSize={50}
            defaultSize={350}
            style={{ height: '50%', position: 'relative' }}
            paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
          >
            <ContextList httpService={httpService} />
            <ContextGrid contextGridData={contextGridData} httpService={httpService} />
          </SplitPane>
        )}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

PlaylistContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  contextItem: PropTypes.string.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        trackName: PropTypes.string,
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  contextSortType: PropTypes.string.isRequired,
  contextListData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        author: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
      })
    ),
  }).isRequired,
  playlistSortType: PropTypes.string.isRequired,
  setGridData: PropTypes.func.isRequired,
  setListData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  contextItem: getContextItem(state),
  dataLoading: getDataLoading(state),
  contextGridData: getContextGridData(state),
  contextSortType: getContextSortType(state),
  contextListData: getContextListData(state),
  playlistSortType: getPlaylistSort(state),
});

const mapDispatchToProps = (dispatch) => ({
  setGridData: (data) => dispatch(setContextGridData(data)),
  setListData: (data) => dispatch(setContextListData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistContext);
