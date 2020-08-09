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
import {
  getSavedAlbumData,
  getContextSortType,
  getDataLoading,
  getSpotifyAuthenticationState,
} from '../store/selectors';
import { setSavedAlbumData, setDataLoading } from '../store/actions';
import SpotifyLogin from './SpotifyLogin';
import HttpService from '../util/httpUtils';
import { blendAlbumLists } from '../util/localFileUtils';

const AlbumContext = ({
  isSpotifyAuthenticated,
  dataLoading,
  savedAlbumData,
  contextSortType,
  setAlbumData,
  setLoading,
  httpService,
}) => {
  const theme = useTheme();

  useEffect(() => {
    const getGridData = () => {
      if (
        !dataLoading ||
        !isSpotifyAuthenticated ||
        (savedAlbumData.offset >= savedAlbumData.spotifyCount &&
          savedAlbumData.spotifyCount > 0)
      ) {
        if (dataLoading) {
          setLoading(false);
        }
        return;
      }
      httpService
        .get(`/spotify/album-list/${savedAlbumData.offset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((rawData) => {
          // console.log('saved album data', rawData, offset);
          const data = rawData.items.map((e) => ({
            albumId: e.album.id,
            albumName: e.album.name,
            artist: e.album.artists[0] ? e.album.artists[0].name : 'unknown artist',
            image: getImage(e.album.images),
            releaseDate: e.album.release_date,
            localId: 0,
            oneDriveId: '',
          }));
          blendAlbumLists(
            data,
            'albumId',
            savedAlbumData,
            rawData.total,
            savedAlbumData.offset + SPOTIFY_PAGE_LIMIT,
            contextSortType,
            setAlbumData
          );
          if (!rawData.next) {
            setLoading(false);
          }
        })
        .catch((error) => console.error(error));
    };
    getGridData();
  }, [
    savedAlbumData,
    contextSortType,
    dataLoading,
    isSpotifyAuthenticated,
    setLoading,
    setAlbumData,
    httpService,
  ]);

  const contextData = {
    name: 'Your Saved Albums',
    description: '',
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader
          contextData={{
            ...contextData,
            spotifyCount: savedAlbumData.spotifyCount,
            loadingCount: savedAlbumData.offset,
          }}
          httpService={httpService}
        />
      </div>
      <div className="row content">
        {isSpotifyAuthenticated && (
          <ContextGrid contextGridData={savedAlbumData} httpService={httpService} />
        )}
        {!isSpotifyAuthenticated && <SpotifyLogin />}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

AlbumContext.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    offset: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
      })
    ),
  }).isRequired,
  contextSortType: PropTypes.string.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyAuthenticationState(state),
  dataLoading: getDataLoading(state),
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlbumContext);
