import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import SplitPane from 'react-split-pane';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import ContextList from './ContextList';
import ContextGrid from './ContextGrid';
import AlbumViewHeader from './AlbumViewHeader';
import RelatedArtistList from './RelatedArtistList';
import { SPOTIFY_PAGE_LIMIT } from '../store/types';
import { getImage } from '../util/utilities';
import { sortByName, sortGridData } from '../util/sortUtils';
import {
  getContextGridData,
  getContextItem,
  getContextListData,
  getContextSortType,
  getDataLoading,
  getRelatedToArtist,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import { setContextGridData, setContextListData, setDataLoading } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';

const RelatedArtistContext = ({
  isSpotifyAuthenticated,
  contextItem,
  relatedToArtist,
  dataLoading,
  contextGridData,
  contextSortType,
  contextListData,
  setGridData,
  setListData,
  setLoading,
  httpService,
}) => {
  const theme = useTheme();
  const [contextDataName, setContextDataName] = useState('Related Artists (choose one)');
  const [loadingState, setLoadingState] = useState({ spotifyCount: 0, loadingCount: 0 });

  // load grid data
  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading || !isSpotifyAuthenticated) {
        return;
      }
      if (contextItem) {
        const offset = contextGridData.data.length;
        httpService
          .get(`/spotify/artist-albums/${contextItem}/${offset}/${SPOTIFY_PAGE_LIMIT}`)
          .then((rawData) => {
            console.log('artist album data', rawData);
            const data = rawData.items.map((e) => ({
              albumId: 0,
              spotifyAlbumId: e.id,
              albumName: e.name,
              artistName: e.artists[0].name,
              image: getImage(e.images),
              releaseDate: e.release_date ? moment(e.release_date).valueOf()  : Date.now(),
              albumGroup: e.album_group,
              albumType: e.album_type,
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
    contextSortType,
    contextGridData,
    dataLoading,
    setGridData,
    setLoading,
    httpService,
  ]);

  // get the list of favorite artists
  useEffect(() => {
    const getList = () => {
      if (
        isSpotifyAuthenticated &&
        dataLoading &&
        (contextListData.offset < contextListData.artistTotal ||
          contextListData.offset < contextListData.albumTotal ||
          contextListData.offset < contextListData.trackTotal ||
          contextListData.offset === 0)
      ) {
        httpService
          .get(
            `/spotify/artist-list/${contextListData.offset}/${SPOTIFY_PAGE_LIMIT}/${contextListData.artistTotal}/${contextListData.albumTotal}/${contextListData.trackTotal}`
          )
          .then((rawData) => {
            console.log('artist list raw data', rawData);
            const artistList = contextListData.data;
            rawData.data.forEach((e) => {
              if (!artistList.some((a) => a.id === e.id)) {
                artistList.push({
                  id: e.id,
                  name: e.name,
                  author: '',
                  description: '',
                  image: getImage(e.images),
                });
              }
            });
            const newOffset = +rawData.offset + SPOTIFY_PAGE_LIMIT;
            const maxCount = Math.max(
              +contextListData.artistTotal,
              +contextListData.albumTotal,
              +contextListData.trackTotal,
              0
            );
            setListData({
              ...rawData,
              offset: newOffset,
              data: artistList.sort(sortByName),
            });
            if (newOffset >= maxCount && maxCount > 0) {
              setLoading(false);
            }
            setLoadingState({
              spotifyCount: maxCount,
              loadingCount: +rawData.offset,
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
    setListData,
    setLoading,
    httpService,
  ]);

  // get context text for the header
  useEffect(() => {
    const getContextData = () => {
      if (isSpotifyAuthenticated && relatedToArtist && !contextItem) {
        httpService
          .get(`/spotify/artist-data/${relatedToArtist}`)
          .then((data) => {
            setContextDataName(`${data.name} (choose related artist)`);
          })
          .catch((error) => console.log(error));
      }
      if (isSpotifyAuthenticated && contextItem) {
        httpService
          .get(`/spotify/artist-data/${contextItem}`)
          .then((data) => {
            setContextDataName(data.name);
          })
          .catch((error) => console.log(error));
      }
    };
    getContextData();
  }, [isSpotifyAuthenticated, contextItem, relatedToArtist, httpService]);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader
          contextData={{
            name: contextDataName,
            description: '',
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
            <SplitPane
              split="vertical"
              minSize={50}
              defaultSize={350}
              style={{ position: 'relative' }}
              paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
            >
              <RelatedArtistList httpService={httpService} />
              <ContextGrid contextGridData={contextGridData} httpService={httpService} />
            </SplitPane>
          </SplitPane>
        )}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

RelatedArtistContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  contextItem: PropTypes.string.isRequired,
  relatedToArtist: PropTypes.string.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  contextGridData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  contextSortType: PropTypes.string.isRequired,
  contextListData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    offset: PropTypes.number,
    artistTotal: PropTypes.number,
    albumTotal: PropTypes.number,
    trackTotal: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        spotifyAlbumId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  setGridData: PropTypes.func.isRequired,
  setListData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  contextItem: getContextItem(state),
  relatedToArtist: getRelatedToArtist(state),
  dataLoading: getDataLoading(state),
  contextGridData: getContextGridData(state),
  contextSortType: getContextSortType(state),
  contextListData: getContextListData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setGridData: (data) => dispatch(setContextGridData(data)),
  setListData: (data) => dispatch(setContextListData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RelatedArtistContext);
