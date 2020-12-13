import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, Modal, Icon } from 'semantic-ui-react';
import {
  setContextGridData,
  setContextItem,
  resetContextListData,
  setContextType,
  setDataLoading,
  setRelatedToArtist,
  addSavedAlbum,
  removeSavedAlbum,
} from '../store/actions';
import { ModalDisplayTypes } from '../store/types';
import HttpService from '../util/httpUtils';
import { getContextSortType, getSavedAlbumData } from '../store/selectors';
import SpotifyModalDisplay from './SpotifyModalDisplay';
import LocalModalDisplay from './LocalModalDisplay';
import {
  createLocalTracks,
  createOneDriveTracks,
  tearDownLocalTracks,
  tearDownOneDriveTracks,
} from '../util/localFileUtils';

const ModalAlbumDeprecated = ({
  spotifyAlbumId,
  artistName,
  albumName,
  image,
  localId,
  oneDriveId,
  useMiniImage,
  savedAlbumData,
  httpService,
}) => {
  const getInitialDisplayType = () => {
    if (spotifyAlbumId) {
      return ModalDisplayTypes.Spotify;
    }
    if (localId) {
      return ModalDisplayTypes.Local;
    }
    if (oneDriveId) {
      return ModalDisplayTypes.OneDrive;
    }
    return '';
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDisplayType, setModalDisplayType] = useState(getInitialDisplayType());

  const modalTrigger = () =>
    image ? (
      <Image
        size={useMiniImage ? 'mini' : 'medium'}
        style={{ cursor: 'pointer' }}
        src={image}
        onClick={() => setModalOpen(true)}
      />
    ) : (
      <Icon
        link
        name="file image outline"
        size="huge"
        onClick={() => setModalOpen(true)}
      />
    );

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
    <Modal trigger={modalTrigger()} open={modalOpen} onClose={() => setModalOpen(false)}>
      {modalOpen && spotifyAlbumId && modalDisplayType === ModalDisplayTypes.Spotify && (
        <SpotifyModalDisplay
          spotifyAlbumId={spotifyAlbumId}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {modalOpen && localId > 0 && modalDisplayType === ModalDisplayTypes.Local && (
        <LocalModalDisplay
          albumFileId={localId}
          spotifyAlbumId={spotifyAlbumId}
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
      {modalOpen && oneDriveId && modalDisplayType === ModalDisplayTypes.OneDrive && (
        <LocalModalDisplay
          albumFileId={oneDriveId}
          spotifyAlbumId={spotifyAlbumId}
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
    </Modal>
  );
};

ModalAlbumDeprecated.propTypes = {
  spotifyAlbumId: PropTypes.string,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  localId: PropTypes.number,
  oneDriveId: PropTypes.string,
  useMiniImage: PropTypes.bool,
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

ModalAlbumDeprecated.defaultProps = {
  spotifyAlbumId: null,
  localId: 0,
  oneDriveId: '',
  useMiniImage: false,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
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
  removeAlbum: (savedAlbumData, spotifyAlbumId) =>
    removeSavedAlbum(savedAlbumData, spotifyAlbumId, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalAlbumDeprecated);
