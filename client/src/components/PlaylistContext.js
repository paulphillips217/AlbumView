import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextList from './ContextList';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { ContextType, GridDataType, SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortGridData } from '../util/sortUtils';
import {
  getContextGridColumns,
  getContextGridData,
  getContextGridMore,
  getContextGridOffset,
  getContextItem,
  getContextListData,
  getContextListMore,
  getContextListOffset,
  getContextSortType,
  getDataLoading,
  getPlaylistSort,
} from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextGridType,
  setContextListData,
  setContextListMore,
  setContextListOffset,
  setDataLoading,
} from '../store/actions';

const PlaylistContext = ({
  contextItem,
  dataLoading,
  contextGridData,
  contextGridOffset,
  contextGridMore,
  contextSortType,
  contextListData,
  contextListOffset,
  contextListMore,
  playlistSortType,
  setContextGridData,
  setContextGridType,
  setContextGridOffset,
  setContextGridMore,
  setContextListData,
  setContextListOffset,
  setContextListMore,
  setDataLoading,
  httpService,
}) => {
  const theme = useTheme();
  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading) {
        return;
      }
      if (contextItem) {
        httpService
          .get(
            `/playlist-tracks/${contextItem}/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`
          )
          .then((rawData) => {
            const data = rawData.items.map((e) => ({
              trackId: e.track.id,
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
            setContextGridType(GridDataType.Track);
            setContextGridMore(!!rawData.next);
            if (!rawData.next) {
              setDataLoading(false);
            }
          })
          .catch((error) => console.log(error));
      } else {
        setContextGridData([]);
        setContextGridType(GridDataType.Track);
        setContextGridMore(false);
        setDataLoading(false);
      }
    };
    getGridData();
  }, [contextItem, contextGridOffset]);

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

  useEffect(() => {
    const getList = () => {
      httpService
        .get(`/playlist-list/${contextListOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((data) => {
          const parsedData = data.items.map((e) => ({
            id: e.id,
            name: e.name,
            author: e.owner.display_name,
            description: e.description,
            image: getImage(e.images),
          }));
          setContextListData(
            sortGridData(contextListData.concat(parsedData), playlistSortType)
          );
          setContextListMore(!!data.next);
        })
        .catch((error) => console.log(error));
    };
    getList();
  }, [contextListOffset]);

  useEffect(() => {
    // get all the pages in the background
    if (contextListOffset < contextListData.length && contextListMore) {
      const newPageOffset = contextListData.length;
      setContextListOffset(newPageOffset);
    }
  }, [contextListData, contextListOffset, contextListMore]);

  const [contextData, setContextData] = useState({ name: '', description: '' });

  useEffect(() => {
    const getContextData = () => {
      if (contextItem) {
        httpService
          .get(`/playlist-data/${contextItem}`)
          .then((data) => {
            setContextData({
              name: data.name,
              description: data.description,
            });
          })
          .catch((error) => console.log(error));
      } else {
        setContextData({
          name: 'Please Select a Playlist',
          description: '',
        });
      }
    };
    getContextData();
  }, [contextItem, httpService]);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        <SplitPane
          split="vertical"
          minSize={50}
          defaultSize={350}
          style={{ height: '50%', position: 'relative' }}
          paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
        >
          <ContextList httpService={httpService} />
          <ContextGrid httpService={httpService} />
        </SplitPane>
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

PlaylistContext.propTypes = {
  contextItem: PropTypes.string.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  contextSortType: PropTypes.string.isRequired,
  contextListData: PropTypes.array.isRequired,
  contextListOffset: PropTypes.number.isRequired,
  contextListMore: PropTypes.bool.isRequired,
  playlistSortType: PropTypes.string.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridType: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
  setContextListMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  contextItem: getContextItem(state),
  dataLoading: getDataLoading(state),
  contextGridColumns: getContextGridColumns(state),
  contextGridData: getContextGridData(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
  contextSortType: getContextSortType(state),
  contextListData: getContextListData(state),
  contextListOffset: getContextListOffset(state),
  contextListMore: getContextListMore(state),
  playlistSortType: getPlaylistSort(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridType: (type) => dispatch(setContextGridType(type)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
  setContextListMore: (offset) => dispatch(setContextListMore(offset)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistContext);
