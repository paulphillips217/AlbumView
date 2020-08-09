import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';
import { Grid, Header, Image, Menu, Modal } from 'semantic-ui-react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import HttpService from '../util/httpUtils';
import { getRandomInt } from '../util/utilities';
import { ModalDisplayTypes } from '../store/types';

const LocalModalDisplay = ({
  albumFileId,
  albumId,
  localId,
  oneDriveId,
  artistName,
  albumName,
  setUpTracks,
  tearDownTracks,
  setModalDisplayType,
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
      console.log('LocalModalDisplay initial render', albumFileId);
      const tracks = await setUpTracks(albumFileId);
      console.log('handleModalOpen tracks', tracks);
      setAlbumTrackList(tracks);
      getAlbumArt();
    };
    initializeTracks();

    // returned function will be called on component unmount
    return () => {
      tearDownTracks(albumTrackList);
      console.log('LocalModalDisplay will unmount', albumFileId);
    };
  }, []);
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

  console.log('default setModalDisplayType:', setModalDisplayType);
  if (setModalDisplayType === null) {
    console.log('setModalDisplayType IS NULL');
  }

  let typeCount = albumId ? 1 : 0;
  typeCount += localId ? 1 : 0;
  typeCount += oneDriveId ? 1 : 0;

  return (
    <>
      <Modal.Header style={theme}> {albumName}</Modal.Header>
      <Modal.Content image style={theme}>
        <Image wrapped src={albumImageUrl} />
        <Modal.Description style={{ width: '80%' }}>
          <>
            <Grid columns="equal" style={{ marginTop: '0' }}>
              <Grid.Column style={{ padding: '0' }}>
                <Header
                  style={{
                    ...theme,
                    paddingLeft: '10px',
                    paddingTop: '10px',
                    paddingBottom: '20px',
                    cursor: 'pointer',
                  }}
                >
                  {artistName}
                </Header>
              </Grid.Column>
              <Grid.Column floated="right" style={{ padding: '0' }}>
                {typeCount > 1 && setModalDisplayType !== null && (
                  <Menu compact floated="right">
                    {albumId && (
                      <Menu.Item
                        name="Spotify"
                        onClick={() => setModalDisplayType(ModalDisplayTypes.Spotify)}
                      >
                        Spotify
                      </Menu.Item>
                    )}
                    {localId > 0 && (
                      <Menu.Item
                        name="Local"
                        active={localId === albumFileId}
                        onClick={() => setModalDisplayType(ModalDisplayTypes.Local)}
                      >
                        Local
                      </Menu.Item>
                    )}
                    {oneDriveId && (
                      <Menu.Item
                        name="OneDrive"
                        active={oneDriveId === albumFileId}
                        onClick={() => setModalDisplayType(ModalDisplayTypes.OneDrive)}
                      >
                        OneDrive
                      </Menu.Item>
                    )}
                  </Menu>
                )}
              </Grid.Column>
            </Grid>
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
  albumFileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  albumId: PropTypes.string,
  localId: PropTypes.number,
  oneDriveId: PropTypes.string,
  artistName: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  setUpTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  setModalDisplayType: PropTypes.func,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

LocalModalDisplay.defaultProps = {
  setModalDisplayType: null,
  albumId: null,
  localId: null,
  oneDriveId: null,
};

export default LocalModalDisplay;
