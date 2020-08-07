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

const ModalAlbum = ({ albumId, image, useMiniImage, httpService }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDisplayType, setModalDisplayType] = useState(ModalDisplayTypes.Spotify);

  const modalTrigger = () =>
    image ? (
      <Image
        size={useMiniImage ? 'mini' : ''}
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

  // render child component conditional on modalOpen so that the data is queried on initial render
  return (
    <Modal trigger={modalTrigger()} open={modalOpen} onClose={() => setModalOpen(false)}>
      {modalOpen && modalDisplayType === ModalDisplayTypes.Spotify && (
        <SpotifyModalDisplay
          albumId={albumId}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {modalOpen && modalDisplayType === ModalDisplayTypes.Local && (
        <div> Hello World, its Local</div>
      )}
      {modalOpen && modalDisplayType === ModalDisplayTypes.OneDrive && (
        <div> Hello Moon Child, its OneDrive</div>
      )}
    </Modal>
  );
};

ModalAlbum.propTypes = {
  albumId: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  useMiniImage: PropTypes.bool,
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
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

ModalAlbum.defaultProps = {
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
  removeAlbum: (savedAlbumData, albumId) =>
    removeSavedAlbum(savedAlbumData, albumId, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalAlbum);
