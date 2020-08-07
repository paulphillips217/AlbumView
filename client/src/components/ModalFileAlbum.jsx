import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'semantic-ui-react';
import 'react-h5-audio-player/lib/styles.css';
import HttpService from '../util/httpUtils';
import LocalModalDisplay from './LocalModalDisplay';

const ModalFileAlbum = ({
  albumIndex,
  artistName,
  albumName,
  setUpTracks,
  tearDownTracks,
  httpService,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Modal
      trigger={(
        <Button
          onClick={() => setModalOpen(true)}
        >
          {artistName}
        </Button>
      )}
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      {modalOpen && (
        <LocalModalDisplay
          albumIndex={albumIndex}
          artistName={artistName}
          albumName={albumName}
          setUpTracks={setUpTracks}
          tearDownTracks={tearDownTracks}
          httpService={httpService}
        />
      )}
    </Modal>
  );
};

ModalFileAlbum.propTypes = {
  albumIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  setUpTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

export default ModalFileAlbum;
