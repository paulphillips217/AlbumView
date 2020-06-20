import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
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
  getContextSortType,
  getDataLoading,
} from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextGridType,
  setDataLoading,
} from '../store/actions';

const AlbumContext = ({
  dataLoading,
  contextGridData,
  contextGridOffset,
  contextGridMore,
  contextSortType,
  setContextGridData,
  setContextGridType,
  setContextGridOffset,
  setContextGridMore,
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
        .get(`/album-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((rawData) => {
          console.log('saved album data', rawData, contextGridOffset);
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
          const newData = contextGridOffset
            ? contextGridData.concat(data)
            : data;
          setContextGridData(sortGridData(newData, contextSortType));
          setContextGridType(GridDataType.Album);
          setContextGridMore(!!rawData.next);
          if (!rawData.next) {
            setDataLoading(false);
          }
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
        <ContextGrid httpService={httpService} />
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

AlbumContext.propTypes = {
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  contextSortType: PropTypes.string.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridType: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  dataLoading: getDataLoading(state),
  contextGridColumns: getContextGridColumns(state),
  contextGridData: getContextGridData(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridType: (type) => dispatch(setContextGridType(type)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumContext);
