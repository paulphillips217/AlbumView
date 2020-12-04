import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'semantic-ui-react';
import {
  setContextGridData,
  setContextItem,
  resetContextListData,
  setContextType,
  setDataLoading,
  setRelatedToArtist,
  addSavedAlbum,
  removeSavedAlbum,
  setSelectedAlbum,
} from '../store/actions';
import { ModalDisplayTypes } from '../store/types';
import HttpService from '../util/httpUtils';
import {
  getContextSortType,
  getSavedAlbumData,
  getSelectedAlbum,
} from '../store/selectors';
import SpotifyModalDisplay from './SpotifyModalDisplay';
import LocalModalDisplay from './LocalModalDisplay';
import {
  createLocalTracks,
  createOneDriveTracks,
  tearDownLocalTracks,
  tearDownOneDriveTracks,
} from '../util/localFileUtils';

const ModalAlbum = ({
  albumId,
  artistName,
  albumName,
  localId,
  oneDriveId,
  savedAlbumData,
  setAlbumId,
  httpService,
}) => {

  const getInitialDisplayType = useCallback(() => {
    if (albumId) {
      return ModalDisplayTypes.Spotify;
    }
    if (localId) {
      return ModalDisplayTypes.Local;
    }
    if (oneDriveId) {
      return ModalDisplayTypes.OneDrive;
    }
    return ModalDisplayTypes.Unknown;
  }, [albumId, localId, oneDriveId]);

  const [modalDisplayType, setModalDisplayType] = useState(getInitialDisplayType());
  useEffect(() => {
    // if the albumId changes, reset the display type as if initial rendering
    setModalDisplayType(getInitialDisplayType());
  }, [getInitialDisplayType]);

  const setUpLocalTracks = (albumFileId) => {
    const album = savedAlbumData.data.find((item) => item.localId === albumFileId);
    return createLocalTracks(album, httpService);
  };

  const setUpOneDriveTracks = (albumFileId) => {
    const album = savedAlbumData.data.find((item) => item.oneDriveId === albumFileId);
    return createOneDriveTracks(album, httpService);
  };

  // render child component conditional on modalOpen so that the data is queried on initial render
  return (
    <Modal open={albumId !== ''} onClose={() => setAlbumId('')}>
      {albumId && modalDisplayType === ModalDisplayTypes.Spotify && (
        <SpotifyModalDisplay
          albumId={albumId}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {localId > 0 && modalDisplayType === ModalDisplayTypes.Local && (
        <LocalModalDisplay
          albumFileId={localId}
          albumId={albumId}
          localId={localId}
          oneDriveId={oneDriveId}
          artistName={artistName}
          albumName={albumName}
          tearDownTracks={tearDownLocalTracks}
          setUpTracks={setUpLocalTracks}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {oneDriveId && modalDisplayType === ModalDisplayTypes.OneDrive && (
        <LocalModalDisplay
          albumFileId={oneDriveId}
          albumId={albumId}
          localId={localId}
          oneDriveId={oneDriveId}
          artistName={artistName}
          albumName={albumName}
          tearDownTracks={tearDownOneDriveTracks}
          setUpTracks={setUpOneDriveTracks}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {modalDisplayType === ModalDisplayTypes.Unknown && (
        <div>Error: unknown modal display type</div>
      )}
    </Modal>
  );
};

ModalAlbum.propTypes = {
  albumId: PropTypes.string.isRequired,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  localId: PropTypes.number,
  oneDriveId: PropTypes.string,
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
      })
    ),
  }).isRequired,
  setAlbumId: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

ModalAlbum.defaultProps = {
  localId: 0,
  oneDriveId: '',
  artistName: '',
  albumName: '',
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
  albumId: getSelectedAlbum(state),
});

const mapDispatchToProps = (dispatch) => ({
  setType: (type) => dispatch(setContextType(type)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  resetListData: () => dispatch(resetContextListData()),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
  addAlbum: (album, savedAlbumData, contextSortType) =>
    addSavedAlbum(album, savedAlbumData, contextSortType, dispatch),
  removeAlbum: (savedAlbumData, albumId) =>
    removeSavedAlbum(savedAlbumData, albumId, dispatch),
  setAlbumId: (id) => dispatch(setSelectedAlbum(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalAlbum);
