import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Image, Header, Modal, Icon } from 'semantic-ui-react';
import moment from 'moment';
import { getImage } from '../util/utilities';
import AlbumGridColumn from './AlbumGridColumn';

const ModalAlbum = ({ albumId, image, useImage, httpService }) => {
  const [albumData, setAlbumData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [trackHearts, setTrackHearts] = useState([]);
  const [albumHeart, setAlbumHeart] = useState(false);

  useEffect(() => {
    const getHeartSettings = () => {
      if (modalOpen && albumId) {
        httpService
          .get(`/albums/contains/${albumId}`)
          .then((data) => {
            setAlbumHeart(data[0]);
          })
          .catch((error) => console.error(error));
      }
      if (modalOpen && albumData.tracks && albumData.tracks.items) {
        const trackIds = albumData.tracks.items
          .reduce((result, item) => result.concat([item.id]), [])
          .join();
        httpService
          .get(`/tracks/contains/${trackIds}`)
          .then((data) => {
            setTrackHearts(data);
          })
          .catch((error) => console.error(error));
      }
    };
    getHeartSettings();
  }, [modalOpen, albumId, albumData, httpService]);

  const headerTitle = albumData.release_date
    ? `${albumData.name} (${moment(albumData.release_date).format('YYYY')}) `
    : `${albumData.name} `;

  let discTracks = [];
  let leftSideTracks = [];
  let rightSideTracks = [];
  if (albumData.tracks) {
    // first group the tracks by disc
    // discTracks is an array of arrays (a track array for each disc)
    discTracks = albumData.tracks.items.reduce((result, item) => {
      if (result.length < item.disc_number) {
        result.push([item]);
      } else {
        result[item.disc_number - 1].push(item);
      }
      return result;
    }, []);
    console.log('disc tracks', discTracks);

    // now for each disc, break up the tracks by left and right side (ie, display columns)
    leftSideTracks = discTracks.map((discArray) =>
      discArray.slice(0, Math.ceil(discArray.length / 2))
    );
    rightSideTracks = discTracks.map((discArray) =>
      discArray.length > 1 ? discArray.slice(discArray.length / -2) : []
    );
  }

  const getTrackHeartOffset = (discNumber) => {
    return discTracks.reduce((result, disc, index) => {
      if (index < discNumber) {
        return result + disc.length;
      }
      return result;
    }, 0);
  };

  const handleModalOpen = () => {
    if (albumId) {
      httpService
        .get(`/album-data/${albumId}`)
        .then((data) => {
          setAlbumData(data);
        })
        .catch((error) => console.error(error));
      setModalOpen(true);
    }
  };

  const handleTrackHeartClick = (id, index, remove) => {
    console.log('handle track heart click', id, index, remove);
    if (id) {
      if (remove) {
        httpService
          .delete(`/delete-tracks/${id}`)
          .then((data) => {
            console.log('handleTrackHeartClick delete response');
          })
          .catch((error) => console.error(error));
      } else {
        httpService
          .put(`/save-tracks/${id}`)
          .then((data) => {
            console.log('handleTrackHeartClick save response');
          })
          .catch((error) => console.error(error));
      }
      setTrackHearts((h) => [
        ...h.slice(0, index),
        !remove,
        ...h.slice(index + 1),
      ]);
    }
  };

  const handleAlbumHeartClick = (remove) => {
    if (remove) {
      httpService
        .delete(`/delete-albums/${albumId}`)
        .then((data) => {
          console.log('handleAlbumHeartClick delete response');
        })
        .catch((error) => console.error(error));
    } else {
      httpService
        .put(`/save-albums/${albumId}`)
        .then((data) => {
          console.log('handleAlbumHeartClick save response');
        })
        .catch((error) => console.error(error));
    }
    setAlbumHeart(!remove);
  };

  const DiscBlock = (discNumber, trackHeartOffset) => (
    <Grid columns={2}>
      {discTracks.length > 1 && (
        <Header size={'small'} className={'disc-number-header'}>
          Disc {discNumber + 1}
        </Header>
      )}
      <Grid.Row>
        <Grid.Column>
          <AlbumGridColumn
            tracks={leftSideTracks[discNumber]}
            trackHearts={trackHearts}
            trackHeartOffset={trackHeartOffset}
            handleTrackHeartClick={handleTrackHeartClick}
          />
        </Grid.Column>
        <Grid.Column>
          <AlbumGridColumn
            tracks={rightSideTracks[discNumber]}
            trackHearts={trackHearts}
            trackHeartOffset={trackHeartOffset}
            handleTrackHeartClick={handleTrackHeartClick}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );

  return (
    <Modal
      trigger={
        <div>
          {useImage && <Image src={image} onClick={() => handleModalOpen()} />}
          {!useImage && (
            <button style={{ width: '95%' }} onClick={() => handleModalOpen()}>
              Album Info
            </button>
          )}
        </div>
      }
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <Modal.Header>
        {headerTitle}
        <Icon
          name={albumHeart ? 'heart' : 'heart outline'}
          size="small"
          color="red"
          onClick={() => handleAlbumHeartClick(albumHeart)}
        />
      </Modal.Header>
      <Modal.Content image>
        <Image wrapped src={albumData.images && getImage(albumData.images)} />
        <Modal.Description style={{ width: '80%' }}>
          <Header style={{ 'padding-bottom': '10px' }}>
            {albumData.artists && albumData.artists[0].name}
          </Header>
          {discTracks &&
            discTracks.map((item, index) =>
              DiscBlock(index, getTrackHeartOffset(index))
            )}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalAlbum.propTypes = {
  albumId: PropTypes.string.isRequired,
  image: PropTypes.string,
  useImage: PropTypes.bool,
  httpService: PropTypes.object.isRequired,
};

ModalAlbum.defaultProps = { image: '', useImage: false };

export default ModalAlbum;
