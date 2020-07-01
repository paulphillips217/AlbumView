import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextList from './ContextList';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortByName, sortGridData } from '../util/sortUtils';
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
  setContextListData,
  setContextListMore,
  setContextListOffset,
  setDataLoading,
} from '../store/actions';
import { useTheme } from 'emotion-theming';

const ArtistContext = ({
  contextItem,
  dataLoading,
  contextGridData,
  contextGridOffset,
  contextGridMore,
  contextSortType,
  contextListData,
  contextListOffset,
  contextListMore,
  setContextGridData,
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
            `/artist-albums/${contextItem}/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`
          )
          .then((rawData) => {
            console.log('artist album data', rawData);
            const data = rawData.items.map((e) => ({
              trackId: '',
              trackName: '',
              albumId: e.id,
              albumName: e.name,
              artist: e.artists[0].name,
              image: getImage(e.images),
              releaseDate: e.release_date,
              albumGroup: e.album_group,
              albumType: e.album_type,
            }));
            const newData = contextGridOffset
              ? contextGridData.concat(data)
              : data;
            setContextGridData(sortGridData(newData, contextSortType));
            setContextGridMore(!!rawData.next);
            if (!rawData.next) {
              setDataLoading(false);
            }
          })
          .catch((error) => console.log(error));
      } else {
        setContextGridData([]);
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
        .get(`/artist-list/${contextListOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((data) => {
          console.log('artist list data', data);
          const parsedData = data.map((e) => ({
            id: e.id,
            name: e.name,
            author: '',
            description: '',
            image: getImage(e.images),
          }));
          setContextListData(
            contextListData.concat(parsedData).sort(sortByName)
          );
          setContextListMore(data && data.artists && !!data.artists.next);
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
          .get(`/artist-data/${contextItem}`)
          .then((data) => {
            setContextData({
              name: data.name,
              description: '',
            });
          })
          .catch((error) => console.log(error));
      } else {
        setContextData({
          name: 'Your Saved Artists',
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
          <ContextGrid
            contextGridData={contextGridData}
            httpService={httpService}
          />
        </SplitPane>
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

ArtistContext.propTypes = {
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
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
  setContextListMore: (offset) => dispatch(setContextListMore(offset)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ArtistContext);
