import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid, Visibility } from 'semantic-ui-react';
import { getImage, sortByArtistThenAlbum } from '../util/utilities';
import {
  getContextType,
  getContextItem,
  getContextGridData,
  getContextGridOffset,
  getContextGridType,
  getContextGridMore,
} from '../store/selectors';
import AlbumAccordion from './AlbumAccordion';
import { ContextType, GridDataType, SPOTIFY_PAGE_LIMIT } from '../store/types';
import PropTypes from 'prop-types';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextGridType,
} from '../store/actions';
import ModalAlbum from './ModalAlbum';

const ContextGrid = ({
  contextType,
  contextItem,
  contextGridData,
  contextGridType,
  contextGridOffset,
  contextGridMore,
  setContextGridData,
  setContextGridType,
  setContextGridOffset,
  setContextGridMore,
  httpService,
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const getGridData = () => {
      console.log(
        'get context grid',
        contextType,
        contextItem,
        contextGridOffset
      );
      switch (contextType) {
        case ContextType.Albums:
          httpService
            .get(`/album-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
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
              const newData = contextGridOffset ? contextGridData : data;
              setContextGridData(newData.sort(sortByArtistThenAlbum));
              setContextGridType(GridDataType.Album);
              setContextGridMore(!!rawData.next);
            })
            .catch((error) => console.log(error));
          break;
        case ContextType.Tracks:
          httpService
            .get(`/track-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
            .then((rawData) => {
              console.log('track data', rawData);
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
              const newData = contextGridOffset
                ? contextGridData.concat(data)
                : data;
              setContextGridData(newData.sort(sortByArtistThenAlbum));
              setContextGridType(GridDataType.Track);
              setContextGridMore(!!rawData.next);
            })
            .catch((error) => console.log(error));
          break;
        case ContextType.Artists:
          if (contextItem) {
            httpService
              .get(
                `/artist-albums/${contextItem}/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`
              )
              .then((rawData) => {
                console.log('artist album data', rawData);
                const data = rawData.items.map((e) => ({
                  id: '',
                  name: '',
                  albumId: e.id,
                  albumName: e.name,
                  artist: e.artists[0].name,
                  image: getImage(e.images),
                  href: e.href,
                  uri: e.uri,
                }));
                const newData = contextGridOffset ? contextGridData : data;
                setContextGridData(newData.sort(sortByArtistThenAlbum));
                setContextGridType(GridDataType.Album);
                setContextGridMore(!!rawData.next);
              })
              .catch((error) => console.log(error));
          } else {
            setContextGridData([]);
            setContextGridType(GridDataType.Album);
            setContextGridMore(false);
          }
          break;
        case ContextType.Playlists:
          if (contextItem) {
            httpService
              .get(
                `/playlist-tracks/${contextItem}/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`
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
                const newData = contextGridOffset
                  ? contextGridData.concat(data)
                  : data;
                setContextGridData(newData);
                setContextGridType(GridDataType.Track);
                setContextGridMore(!!rawData.next);
              })
              .catch((error) => console.log(error));
          } else {
            setContextGridData([]);
            setContextGridType(GridDataType.Track);
            setContextGridMore(false);
          }
          break;
        default:
          setContextGridData([]);
          setContextGridType(GridDataType.Track);
          setContextGridMore(false);
          console.log(
            'unknown context type in ContextGrid.getGridData',
            contextType
          );
      }
    };
    console.log(
      'context grid - getGridData: ',
      contextType,
      contextItem,
      contextGridOffset,
      contextGridMore,
      httpService
    );
    getGridData();
  }, [contextType, contextItem, contextGridOffset]);

  const handleVisibilityUpdate = (e, { calculations }) => {
    if (
      calculations.bottomVisible &&
      contextGridOffset < contextGridData.length &&
      contextGridMore
    ) {
      console.log('bottom reached - increase page offset');
      setContextGridOffset(contextGridData.length);
    }
  };

  const handleAccordionClick = (index) => {
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const GridItem = (item, index) => (
    <Grid.Column key={index}>
      {contextGridType === GridDataType.Track && (
        <AlbumAccordion
          activeIndex={activeIndex}
          index={index}
          item={item}
          httpService={httpService}
          handleAccordionClick={handleAccordionClick}
        />
      )}
      {contextGridType === GridDataType.Album && (
        <div>
          <ModalAlbum
            albumId={item.albumId}
            image={item.image}
            useImage={true}
            httpService={httpService}
          />
          {!!item.artist && <div>{item.artist}</div>}
          {item.name || item.albumName}
        </div>
      )}
    </Grid.Column>
  );

  const AlbumGrid = () => (
    <Grid columns={6} style={{ width: '100%' }}>
      {contextGridData.map((e, index) => GridItem(e, index))}
    </Grid>
  );

  return (
    <div className="grid-container">
      <Visibility onUpdate={handleVisibilityUpdate}>
        {contextGridData && contextGridData.length > 0 ? <AlbumGrid /> : ''}
      </Visibility>
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridType: PropTypes.string.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridType: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextItem: getContextItem(state),
  contextGridData: getContextGridData(state),
  contextGridType: getContextGridType(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridType: (type) => dispatch(setContextGridType(type)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (offset) => dispatch(setContextGridMore(offset)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextGrid);