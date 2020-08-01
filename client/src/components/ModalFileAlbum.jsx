import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';
import { Header, Image, Modal } from 'semantic-ui-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import HttpService from '../util/httpUtils';

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
  const [albumImageUrl, setAlbumImageUrl] = useState('');

  const getAlbumArt = () => {
    const artist = encodeURIComponent(artistName);
    const album = encodeURIComponent(albumName);
    httpService
      .get(`/last-fm/last-album/${artist}/${album}`)
      .then((rawData) => {
        console.log('Last.fm data', rawData);
        if (rawData && rawData.album) {
          const image = rawData.album.image.find((i) => i.size === 'extralarge');
          setAlbumImageUrl(image['#text']);
          console.log('getAlbumArt url: ', image['#text']);
        }
      })
      .catch((error) => console.log(error));
  };

  const handleModalOpen = async () => {
    console.log('handleModalOpen', albumIndex);
    const tracks = await setUpTracks(albumIndex);
    console.log('handleModalOpen tracks', tracks);
    setAlbumTrackList(tracks);
    getAlbumArt();
    setModalOpen(true);
  };

  const handleModalClose = () => {
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

  return (
    <Modal
      trigger={(
        <div
          style={{ cursor: 'pointer' }}
          onClick={handleModalOpen}
          onKeyPress={handleModalOpen}
          role='button'
          tabIndex={albumIndex}
        >
          {artistName}
        </div>
      )}
      open={modalOpen}
      onClose={handleModalClose}
    >
      <Modal.Header style={theme}> 
        {' '}
        {albumName}
      </Modal.Header>
      <Modal.Content image style={theme}>
        <Image wrapped src={albumImageUrl} />
        <Modal.Description style={{ width: '80%' }}>
          <>
            <Header style={{ ...theme, paddingBottom: '10px', cursor: 'pointer' }}>
              {artistName}
            </Header>
            <ol>
              {albumTrackList.length > 0 &&
                albumTrackList.map((item, index) => (
                  <li
                    key={Date.now()}
                    style={{
                      color: currentTrack === index ? 'green' : theme.color,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleClickListItem(index)}
                    onKeyPress={() => handleClickListItem(index)}
                    role='menu'
                    tabIndex={index}
                  >
                    {item.name}
                  </li>
                ))}
            </ol>
            <AudioPlayer
              autoPlay
              header={albumTrackList.length > 0 ? albumTrackList[currentTrack].name : ''}
              src={albumTrackList.length > 0 ? albumTrackList[currentTrack].url : ''}
              onClickPrevious={handleClickPrevious}
              onClickNext={handleClickNext}
              onEnded={handleClickNext}
              showSkipControls
              showJumpControls={false}
              customAdditionalControls={[]}
            />
          </>
        </Modal.Description>
      </Modal.Content>
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
