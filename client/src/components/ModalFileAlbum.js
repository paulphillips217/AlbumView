import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Header, Modal } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

// audio player from https://www.npmjs.com/package/react-h5-audio-player

const ModalFileAlbum = ({
  albumIndex,
  artistName,
  albumName,
  setUpTracks,
  tearDownTracks,
  httpService,
}) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [albumTrackList, setAlbumTrackList] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);

  const handleModalOpen = async () => {
    console.log('handleModalOpen', albumIndex);
    const tracks = await setUpTracks(albumIndex);
    console.log('handleModalOpen tracks', tracks);
    setAlbumTrackList(tracks);
    //setAlbumTrackList(tracks.map((t) => URL.createObjectURL(fileData[t])));
    setModalOpen(true);
  };

  const handleModalClose = () => {
    //albumTrackList.map((t) => URL.revokeObjectURL(t));
    tearDownTracks(albumTrackList);
    setModalOpen(false);
  };

  const handleClickPrevious = () => {
    setCurrentTrack(currentTrack <= 0 ? 0 : currentTrack - 1);
  };

  const handleClickNext = () => {
    setCurrentTrack(
      currentTrack >= albumTrackList.length - 1
        ? albumTrackList.length - 1
        : currentTrack + 1
    );
  };

  const handleClickListItem = (index) => {
    setCurrentTrack(index);
  };

  // currently the header is white-on-white
  return (
    <Modal
      trigger={
        <div style={{ cursor: 'pointer' }} onClick={handleModalOpen}>
          {artistName}
        </div>
      }
      open={modalOpen}
      onClose={handleModalClose}
    >
      <Modal.Header style={theme}> {albumName}</Modal.Header>
      <Modal.Content image style={theme}>
        <Modal.Description style={{ width: '80%' }}>
          <Fragment>
            <Header
              style={{ ...theme, paddingBottom: '10px', cursor: 'pointer' }}
            >
              {artistName}
            </Header>
            <ol>
              {albumTrackList.length > 0 &&
                albumTrackList.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      color: currentTrack === index ? 'green' : theme.color,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleClickListItem(index)}
                  >
                    {item.name}
                  </li>
                ))}
            </ol>
            <AudioPlayer
              autoPlay
              header={
                albumTrackList.length > 0
                  ? albumTrackList[currentTrack].name
                  : ''
              }
              src={
                albumTrackList.length > 0
                  ? albumTrackList[currentTrack].url
                  : ''
              }
              onClickPrevious={handleClickPrevious}
              onClickNext={handleClickNext}
              onEnded={handleClickNext}
              showSkipControls={true}
              showJumpControls={false}
              customAdditionalControls={[]}
            />
          </Fragment>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalFileAlbum.propTypes = {
  albumIndex: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  setUpTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

export default ModalFileAlbum;
