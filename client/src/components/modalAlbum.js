import { Grid, Image, Header, Modal, Icon } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import { msToSongTime } from '../util/utilities';
import httpService from '../util/httpUtils';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const ModalAlbum = ({
  handleModalOpen,
  handleModalClose,
  open,
  albumId,
  albumName,
  artist,
  image,
  albumData,
  httpService,
}) => {
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

  const getHeartSettings = () => {
    if (open && albumData.tracks && albumData.tracks.items) {
      console.log('getHeartSettings items: ', albumData.tracks.items);
      const trackIds = albumData.tracks.items
        .reduce((result, item) => result.concat([item.id]), [])
        .join();
      console.log('getHeartSettings track ids: ', trackIds);
      httpService
        .get(`/tracks/contains/${trackIds}`)
        .then((data) => {
          console.log('heart settings: ', data);
          setHearts(data);
        })
        .catch((error) => console.log(error));
    }
  };

  const [hearts, setHearts] = useState([]);
  useEffect(getHeartSettings, []);

  const handleTrackHeartClick = (id, remove) => {
    if (id) {
      console.log('handleTrackHeartClick ', id, remove);
      if (remove) {
        httpService
          .delete(`/delete-tracks/${id}`)
          .then((data) => {
            console.log('handleTrackHeartClick response: ', data);
          })
          .catch((error) => console.log(error));
      } else {
        httpService
          .put(`/save-tracks/${id}`)
          .then((data) => {
            console.log('handleTrackHeartClick response: ', data);
          })
          .catch((error) => console.log(error));
      }
    }
  };

  return (
    <Modal
      trigger={
        <button
          style={{ width: '95%' }}
          onClick={() => {
            handleModalOpen(albumId);
          }}
        >
          Album Info
        </button>
      }
      open={open}
      onClose={() => handleModalClose()}
    >
      <Modal.Header>{albumName}</Modal.Header>
      <Modal.Content image>
        <Image wrapped src={image} />
        <Modal.Description style={{ width: '80%' }}>
          <Header style={{ 'padding-bottom': '10px' }}>{artist}</Header>

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
                              hearts[item.track_number - 1]
                                ? 'heart'
                                : 'heart outline'
                            }
                            size="small"
                            color="red"
                            onClick={() =>
                              handleTrackHeartClick(
                                item.id,
                                hearts[item.track_number - 1]
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
                              hearts[item.track_number - 1]
                                ? 'heart'
                                : 'heart outline'
                            }
                            size="small"
                            color="red"
                            onClick={() =>
                              handleTrackHeartClick(
                                item.id,
                                hearts[item.track_number - 1]
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
  handleModalOpen: PropTypes.func.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  albumId: PropTypes.string.isRequired,
  albumName: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  albumData: PropTypes.object.isRequired,
  httpService: PropTypes.object.isRequired,
};

ModalAlbum.defaultProps = {
  handleModalOpen: () => console.log('modal open'),
  handleModalClose: () => console.log('modal close'),
  open: false,
  albumId: '',
  albumName: '',
  artist: '',
  image: '',
  albumData: {},
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
