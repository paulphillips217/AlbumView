import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid, Visibility } from 'semantic-ui-react';
import { getImage, sortByArtistThenAlbum } from '../util/utilities';
import { getContextType, getContextItem } from '../store/selectors';
import httpService from '../util/httpUtils';
import AlbumAccordion from './AlbumAccordion';
import { ContextType, GridDataType } from '../store/types';
import PropTypes from 'prop-types';

const PAGE_LIMIT = 50;

const ContextGrid = ({ contextType, contextItem, httpService }) => {
  const [gridData, setGridData] = useState([]);
  const [gridDataType, setGridDataType] = useState(GridDataType.Track);
  const [pageOffset, setPageOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const getGridData = () => {
      switch (contextType) {
        case ContextType.Albums:
          httpService
            .get(`/album-list/${pageOffset}/${PAGE_LIMIT}`)
            .then((rawData) => {
              console.log('artist data', rawData);
              const data = rawData.items.map((e) => ({
                id: '',
                name: '',
                albumId: e.album.id,
                albumName: e.album.name,
                artist: e.album.artists[0].name,
                image: getImage(e.album.images),
                href: e.href,
                uri: e.uri,
              }));
              const newData = pageOffset ? gridData.concat(data) : data;
              setGridData(newData.sort(sortByArtistThenAlbum));
              setGridDataType(GridDataType.Album);
            })
            .catch((error) => console.log(error));
          break;
        case ContextType.Playlists:
          if (contextItem) {
            httpService
              .get(
                `/playlist-tracks/${contextItem}/${pageOffset}/${PAGE_LIMIT}`
              )
              .then((rawData) => {
                const data = rawData.items.map((e) => ({
                  id: e.track.id,
                  name: e.track.name,
                  albumId: e.track.album.id,
                  albumName: e.track.album.name,
                  artist: e.track.album.artists[0].name,
                  image: getImage(e.track.album.images),
                  href: e.track.href,
                  uri: e.track.uri,
                }));
                const newData = pageOffset ? gridData.concat(data) : data;
                setGridData(newData);
                setGridDataType(GridDataType.Track);
              })
              .catch((error) => console.log(error));
          } else {
            setGridData([]);
            setGridDataType(GridDataType.Track);
          }
          break;
        default:
          setGridData([]);
          setGridDataType(GridDataType.Track);
          console.log(
            'unknown context type in ContextGrid.getGridData',
            contextType
          );
      }
    };
    getGridData();
  }, [contextType, contextItem, pageOffset, httpService]);

  const handleVisibilityUpdate = (e, { calculations }) => {
    if (calculations.bottomVisible && pageOffset < gridData.length) {
      console.log('bottom reached - increase page offset');
      setPageOffset(gridData.length);
    }
  };

  const handleAccordionClick = (index) => {
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const GridItem = (item, index) => (
    <Grid.Column key={index}>
      <AlbumAccordion
        activeIndex={activeIndex}
        index={index}
        item={item}
        gridDataType={gridDataType}
        handleAccordionClick={handleAccordionClick}
      />
    </Grid.Column>
  );

  const AlbumGrid = () => (
    <Grid columns={6} style={{ width: '100%' }}>
      {gridData.map((e, index) => GridItem(e, index))}
    </Grid>
  );

  return (
    <div className="App">
      <Visibility onUpdate={handleVisibilityUpdate}>
        {gridData && gridData.length > 0 ? <AlbumGrid /> : ''}
      </Visibility>
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextItem: getContextItem(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(ContextGrid);
