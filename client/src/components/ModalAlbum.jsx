import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'semantic-ui-react';
import { setSelectedAlbumId, setSelectedSpotifyAlbumId } from '../store/actions';
import { ModalDisplayTypes } from '../store/types';
import HttpService from '../util/httpUtils';
import {
  getSavedAlbumData,
  getSelectedAlbumId,
  getSelectedSpotifyAlbumId,
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
  spotifyAlbumId,
  savedAlbumData,
  setAlbumId,
  setSpotifyAlbumId,
  httpService,
}) => {
  const getSavedAlbumIndex = useCallback(
    () =>
      albumId > 0 ? savedAlbumData.data.findIndex((item) => item.albumId === albumId) : 0,
    [albumId, savedAlbumData]
  );

  const getSpotifyAlbumId = useCallback(
    () =>
      albumId > 0
        ? savedAlbumData.data[getSavedAlbumIndex()].spotifyAlbumId
        : spotifyAlbumId,
    [albumId, savedAlbumData, getSavedAlbumIndex, spotifyAlbumId]
  );

  const getInitialDisplayType = useCallback(() => {
    if (getSpotifyAlbumId() !== '') {
      return ModalDisplayTypes.Spotify;
    }
    if (albumId > 0 && savedAlbumData.data[getSavedAlbumIndex()].localId) {
      return ModalDisplayTypes.Local;
    }
    if (albumId > 0 && savedAlbumData.data[getSavedAlbumIndex()].oneDriveId) {
      return ModalDisplayTypes.OneDrive;
    }
    return ModalDisplayTypes.Unknown;
  }, [getSpotifyAlbumId, albumId, savedAlbumData, getSavedAlbumIndex]);

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

  const resetSelectedAlbum = () => {
    setAlbumId(0);
    setSpotifyAlbumId('');
  };

  // render child component conditional on modalOpen so that the data is queried on initial render
  return (
    <Modal open={albumId > 0 || spotifyAlbumId !== ''} onClose={resetSelectedAlbum}>
      {getSpotifyAlbumId() !== '' && modalDisplayType === ModalDisplayTypes.Spotify && (
        <SpotifyModalDisplay
          spotifyAlbumId={getSpotifyAlbumId()}
          setModalDisplayType={setModalDisplayType}
          httpService={httpService}
        />
      )}
      {albumId > 0 &&
        savedAlbumData.data[getSavedAlbumIndex()].localId > 0 &&
        modalDisplayType === ModalDisplayTypes.Local && (
          <LocalModalDisplay
            albumFileId={savedAlbumData.data[getSavedAlbumIndex()].localId}
            spotifyAlbumId={getSpotifyAlbumId()}
            localId={savedAlbumData.data[getSavedAlbumIndex()].localId}
            oneDriveId={savedAlbumData.data[getSavedAlbumIndex()].oneDriveId}
            artistName={savedAlbumData.data[getSavedAlbumIndex()].artistName}
            albumName={savedAlbumData.data[getSavedAlbumIndex()].albumName}
            tearDownTracks={tearDownLocalTracks}
            setUpTracks={setUpLocalTracks}
            setModalDisplayType={setModalDisplayType}
            httpService={httpService}
          />
        )}
      {albumId > 0 &&
        savedAlbumData.data[getSavedAlbumIndex()].oneDriveId &&
        modalDisplayType === ModalDisplayTypes.OneDrive && (
          <LocalModalDisplay
            albumFileId={savedAlbumData.data[getSavedAlbumIndex()].oneDriveId}
            spotifyAlbumId={getSpotifyAlbumId()}
            localId={savedAlbumData.data[getSavedAlbumIndex()].localId}
            oneDriveId={savedAlbumData.data[getSavedAlbumIndex()].oneDriveId}
            artistName={savedAlbumData.data[getSavedAlbumIndex()].artistName}
            albumName={savedAlbumData.data[getSavedAlbumIndex()].albumName}
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
  albumId: PropTypes.number.isRequired,
  spotifyAlbumId: PropTypes.string.isRequired,
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
  setAlbumId: PropTypes.func.isRequired,
  setSpotifyAlbumId: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  albumId: getSelectedAlbumId(state),
  spotifyAlbumId: getSelectedSpotifyAlbumId(state),
  savedAlbumData: getSavedAlbumData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumId: (id) => dispatch(setSelectedAlbumId(id)),
  setSpotifyAlbumId: (id) => dispatch(setSelectedSpotifyAlbumId(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalAlbum);
