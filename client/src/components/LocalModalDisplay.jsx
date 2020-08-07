import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';
import { Header, Image, Modal } from 'semantic-ui-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import HttpService from '../util/httpUtils';
import { getRandomInt } from '../util/utilities';

const LocalModalDisplay = ({
                          albumIndex,
                          artistName,
                          albumName,
                          setUpTracks,
                          tearDownTracks,
                          httpService,
                        }) => {
  const theme = useTheme();
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

  /* eslint-disable no-alert, react-hooks/exhaustive-deps */
  // we only want this to run on mount and unmount
  useEffect(() => {
    const initializeTracks = async () => {
      console.log('LocalModalDisplay initial render', albumIndex);
      const tracks = await setUpTracks(albumIndex);
      console.log('handleModalOpen tracks', tracks);
      setAlbumTrackList(tracks);
      getAlbumArt();
    }
    initializeTracks();

    // returned function will be called on component unmount
    return () => {
      tearDownTracks(albumTrackList);
      console.log('LocalModalDisplay will unmount', albumIndex);
    }
  }, [])
  /* eslint-disable no-alert, react-hooks/exhaustive-deps */

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
    <>
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
                  key={getRandomInt(9999)}
                  style={{
                    color: currentTrack === index ? 'green' : theme.color,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleClickListItem(index)}
                  onKeyPress={() => handleClickListItem(index)}
                  role="menu"
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
    </>
  );
};

LocalModalDisplay.propTypes = {
  albumIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  setUpTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

export default LocalModalDisplay;
