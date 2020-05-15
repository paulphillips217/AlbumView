import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Image, Header, Modal, Icon } from 'semantic-ui-react';
import { msToSongTime } from '../util/utilities';
import { getAuthenticationState } from '../store/selectors';
import httpService from '../util/httpUtils';

const ModalAlbumTest = ({
                      handleModalOpen,
                      handleModalClose,
                      open,
                      albumId,
                      albumName,
                      artist,
                      image,
                      albumData,
                    }) => {
  console.log('Modal Album', albumId);
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
  return (
    <Modal
      trigger={
        <button
          style={{ width: '95%' }}
          onClick={() => handleModalOpen(albumId)}
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
                          <Icon name="heart outline" size="small" color="red" />
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
                          <Icon name="heart outline" size="small" color="red" />
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
  handleModalOpen: PropTypes.func,
  handleModalClose: PropTypes.func,
  open: PropTypes.bool,
  albumId: PropTypes.string,
  albumName: PropTypes.string,
  artist: PropTypes.string,
  image: PropTypes.string,
  albumData: PropTypes.object,
  isAuthenticated: PropTypes.bool.isRequired,
  httpService: PropTypes.object.isRequired,
};

ModalAlbum.defaultProps = {
  handleModalOpen: () => {},
  handleModalClose: () => {},
  open: false,
  albumId: '',
  albumName: '',
  artist: '',
  image: '',
  albumData: {},
};

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(ModalAlbumTest);
