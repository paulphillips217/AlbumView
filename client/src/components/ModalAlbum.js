import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Grid, Image, Header, Modal, Icon } from 'semantic-ui-react';
import moment from 'moment';
import { getImage, msToSongTime } from '../util/utilities';
import httpService from '../util/httpUtils';

const ModalAlbum = ({ albumId, httpService }) => {
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

  const firstHalfTracks = albumData.tracks
    ? albumData.tracks.items.slice(
        0,
        Math.ceil(albumData.tracks.items.length / 2)
      )
    : [];

  const secondHalfTracks =
    albumData.tracks && albumData.tracks.items.length > 1
      ? albumData.tracks.items.slice(albumData.tracks.items.length / -2)
      : [];

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
    if (id) {
      if (remove) {
        httpService
          .delete(`/delete-tracks/${id}`)
          .then((data) => {
          })
          .catch((error) => console.error(error));
        setTrackHearts((h) => [
          ...h.slice(0, index),
          false,
          ...h.slice(index + 1),
        ]);
      } else {
        httpService
          .put(`/save-tracks/${id}`)
          .then((data) => {
          })
          .catch((error) => console.error(error));
        setTrackHearts((h) => [
          ...h.slice(0, index),
          true,
          ...h.slice(index + 1),
        ]);
      }
    }
  };

  const handleAlbumHeartClick = (remove) => {
    if (remove) {
      httpService
        .delete(`/delete-albums/${albumId}`)
        .then((data) => {
        })
        .catch((error) => console.error(error));
      setAlbumHeart(false);
    } else {
      httpService
        .put(`/save-albums/${albumId}`)
        .then((data) => {
        })
        .catch((error) => console.error(error));
      setAlbumHeart(true);
    }
  };

  const headerTitle = albumData.release_date
    ? `${albumData.name} (${moment(albumData.release_date).format('YYYY')}) `
    : `${albumData.name} `;

  return (
    <Modal
      trigger={
        <button style={{ width: '95%' }} onClick={() => handleModalOpen()}>
          Album Info
        </button>
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

          {albumData.tracks && (
            <Grid columns={2}>
              <Grid.Row>
                <Grid.Column>
                  <Grid columns={3}>
                    {firstHalfTracks.map((item) => (
                      <Grid.Row style={{ padding: '0px' }}>
                        <Grid.Column style={{ width: '2rem' }}>
                          {' '}
                          {item.track_number}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: 'calc(100% - 8rem)' }}>
                          {' '}
                          {item.name}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: '3rem' }}>
                          {' '}
                          {msToSongTime(item.duration_ms)}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: '3rem' }}>
                          <Icon
                            name={
                              trackHearts[item.track_number - 1]
                                ? 'heart'
                                : 'heart outline'
                            }
                            size="small"
                            color="red"
                            onClick={() =>
                              handleTrackHeartClick(
                                item.id,
                                item.track_number - 1,
                                trackHearts[item.track_number - 1]
                              )
                            }
                          />
                        </Grid.Column>
                      </Grid.Row>
                    ))}
                  </Grid>
                </Grid.Column>
                <Grid.Column>
                  <Grid columns={3}>
                    {secondHalfTracks.map((item) => (
                      <Grid.Row style={{ padding: '0px' }}>
                        <Grid.Column style={{ width: '2rem' }}>
                          {' '}
                          {item.track_number}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: 'calc(100% - 8rem)' }}>
                          {' '}
                          {item.name}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: '3rem' }}>
                          {' '}
                          {msToSongTime(item.duration_ms)}{' '}
                        </Grid.Column>
                        <Grid.Column style={{ width: '3rem' }}>
                          <Icon
                            name={
                              trackHearts[item.track_number - 1]
                                ? 'heart'
                                : 'heart outline'
                            }
                            size="small"
                            color="red"
                            onClick={() =>
                              handleTrackHeartClick(
                                item.id,
                                item.track_number - 1,
                                trackHearts[item.track_number - 1]
                              )
                            }
                          />
                        </Grid.Column>
                      </Grid.Row>
                    ))}
                  </Grid>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalAlbum.propTypes = {
  albumId: PropTypes.string.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps, props) => ({
  ...props,
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(ModalAlbum);
