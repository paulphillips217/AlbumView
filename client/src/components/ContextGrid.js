import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid, Header } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import {
  filterByAlbumType,
  getImage,
  sortByArtistThenAlbumName,
} from '../util/utilities';
import {
  getContextType,
  getContextItem,
  getContextGridData,
  getContextGridOffset,
  getContextGridType,
  getContextGridMore,
  getContextGridColumns,
  getDataLoading,
} from '../store/selectors';
import { ContextType, GridDataType, SPOTIFY_PAGE_LIMIT } from '../store/types';
import PropTypes from 'prop-types';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextGridType,
  setDataLoading,
} from '../store/actions';
import ModalAlbum from './ModalAlbum';

const ContextGrid = ({
  contextType,
  contextItem,
  dataLoading,
  contextGridData,
  contextGridType,
  contextGridOffset,
  contextGridMore,
  contextGridColumns,
  setContextGridData,
  setContextGridType,
  setContextGridOffset,
  setContextGridMore,
  setDataLoading,
  httpService,
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading) {
        return;
      }
      switch (contextType) {
        case ContextType.Albums:
          httpService
            .get(`/album-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
            .then((rawData) => {
              console.log('saved album data', rawData, contextGridOffset);
              const data = rawData.items.map((e) => ({
                id: '',
                name: '',
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
              setContextGridData(newData.sort(sortByArtistThenAlbumName));
              setContextGridType(GridDataType.Album);
              setContextGridMore(!!rawData.next);
              if (!rawData.next) {
                setDataLoading(false);
              }
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
                artist: e.track.album.artists[0]
                  ? e.track.album.artists[0].name
                  : 'unknown artist',
                image: getImage(e.track.album.images),
                releaseDate: e.track.album.release_date,
              }));
              const newData = contextGridOffset
                ? contextGridData.concat(data)
                : data;
              setContextGridData(newData.sort(sortByArtistThenAlbumName));
              setContextGridType(GridDataType.Track);
              setContextGridMore(!!rawData.next);
              if (!rawData.next) {
                setDataLoading(false);
              }
            })
            .catch((error) => console.log(error));
          break;
        case ContextType.Artists:
        case ContextType.RelatedArtists:
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
                  releaseDate: e.release_date,
                  albumGroup: e.album_group,
                  albumType: e.album_type,
                }));
                const newData = contextGridOffset
                  ? contextGridData.concat(data)
                  : data;
                setContextGridData(newData.sort(sortByArtistThenAlbumName));
                setContextGridType(GridDataType.Album);
                setContextGridMore(!!rawData.next);
                if (!rawData.next) {
                  setDataLoading(false);
                }
              })
              .catch((error) => console.log(error));
          } else {
            setContextGridData([]);
            setContextGridType(GridDataType.Album);
            setContextGridMore(false);
            setDataLoading(false);
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
                  artist: e.track.album.artists[0]
                    ? e.track.album.artists[0].name
                    : 'unknown artist',
                  image: getImage(e.track.album.images),
                  releaseDate: e.track.album.release_date,
                }));
                const newData = contextGridOffset
                  ? contextGridData.concat(data)
                  : data;
                setContextGridData(newData);
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
          break;
        default:
          setContextGridData([]);
          setContextGridType(GridDataType.Track);
          setContextGridMore(false);
          setDataLoading(false);
          console.log(
            'unknown context type in ContextGrid.getGridData',
            contextType
          );
      }
    };
    getGridData();
  }, [contextType, contextItem, contextGridOffset]);

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

  const handleAccordionClick = (index) => {
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const GridItem = (item, index) => (
    <Grid.Column key={index}>
      <div style={theme}>
        <ModalAlbum
          albumId={item.albumId}
          image={item.image}
          httpService={httpService}
        />
        <div style={theme}>
          {!!item.artist && <div>{item.artist}</div>}
          {item.name || item.albumName}
        </div>
      </div>
    </Grid.Column>
  );

  const AlbumGrid = () => (
    <Grid columns={contextGridColumns} style={{ width: '100%' }}>
      {contextGridData.map((e, index) => GridItem(e, index))}
    </Grid>
  );

  const ArtistAlbumType = ({ category, title }) => {
    if (contextGridData.some((item) => filterByAlbumType(item, category))) {
      return (
        <Fragment>
          <Header
            as="h2"
            floated="left"
            style={{ ...theme, paddingTop: '50px' }}
          >
            {title}
          </Header>
          <Grid columns={contextGridColumns} style={{ width: '100%' }}>
            {contextGridData
              .filter((item) => filterByAlbumType(item, category))
              .map((e, index) => GridItem(e, index))}
          </Grid>
        </Fragment>
      );
    } else {
      return '';
    }
  };

  const ArtistAlbumGrid = () => (
    <Fragment>
      <ArtistAlbumType category={'album'} title={'Albums'} />
      <ArtistAlbumType category={'single'} title={'Singles'} />
      <ArtistAlbumType category={'compilation'} title={'Compilations'} />
      <ArtistAlbumType category={'appears_on'} title={'Appears On'} />
    </Fragment>
  );

  const useArtistAlbumGrid =
    contextType === ContextType.Artists ||
    contextType === ContextType.RelatedArtists;

  return (
    <div className="grid-container">
      {useArtistAlbumGrid && contextGridData && contextGridData.length > 0 ? (
        <ArtistAlbumGrid />
      ) : (
        ''
      )}
      {!useArtistAlbumGrid && contextGridData && contextGridData.length > 0 ? (
        <AlbumGrid />
      ) : (
        ''
      )}
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridType: PropTypes.string.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridType: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextItem: getContextItem(state),
  dataLoading: getDataLoading(state),
  contextGridColumns: getContextGridColumns(state),
  contextGridData: getContextGridData(state),
  contextGridType: getContextGridType(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridType: (type) => dispatch(setContextGridType(type)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextGrid);
