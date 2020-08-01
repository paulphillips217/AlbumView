import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Grid, Image, Header, Modal, Icon } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import { getImage } from '../util/utilities';
import AlbumGridColumn from './AlbumGridColumn';
import {
  setContextGridData,
  setContextItem,
  resetContextListData,
  setContextType,
  setDataLoading,
  setRelatedToArtist,
} from '../store/actions';
import { ContextType } from '../store/types';
import HttpService from '../util/httpUtils';

const ModalAlbum = ({
  albumId,
  image,
  useMiniImage,
  setType,
  setItem,
  setLoading,
  setRelatedTo,
  setGridData,
  resetListData,
  httpService,
}) => {
  const theme = useTheme();
  const [albumData, setAlbumData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [trackHearts, setTrackHearts] = useState([]);
  const [albumHeart, setAlbumHeart] = useState(false);
  const [playerInactive, setPlayerInactive] = useState(false);

  useEffect(() => {
    const getHeartSettings = () => {
      if (modalOpen && albumId) {
        httpService
          .get(`/spotify/albums/contains/${albumId}`)
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
          .get(`/spotify/tracks/contains/${trackIds}`)
          .then((data) => {
            setTrackHearts(data);
          })
          .catch((error) => console.error(error));
      }
    };
    getHeartSettings();
  }, [modalOpen, albumId, albumData, httpService]);

  const headerTitle = albumData.release_date
    ? `${albumData.name} (${moment(albumData.release_date).format('YYYY')})`
    : `${albumData.name}`;

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

  const getTrackIndexOffset = (discNumber) => {
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
        .get(`/spotify/album-data/${albumId}`)
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
          .delete(`/spotify/delete-tracks/${id}`)
          .then(() => {
            console.log('handleTrackHeartClick delete response');
          })
          .catch((error) => console.error(error));
      } else {
        httpService
          .put(`/spotify/save-tracks/${id}`)
          .then(() => {
            console.log('handleTrackHeartClick save response');
          })
          .catch((error) => console.error(error));
      }
      setTrackHearts((h) => [...h.slice(0, index), !remove, ...h.slice(index + 1)]);
    }
  };

  const handleAlbumHeartClick = (remove) => {
    if (remove) {
      httpService
        .delete(`/spotify/delete-albums/${albumId}`)
        .then(() => {
          console.log('handleAlbumHeartClick delete response');
        })
        .catch((error) => console.error(error));
    } else {
      httpService
        .put(`/spotify/save-albums/${albumId}`)
        .then(() => {
          console.log('handleAlbumHeartClick save response');
        })
        .catch((error) => console.error(error));
    }
    setAlbumHeart(!remove);
  };

  const handlePlayAlbum = async () => {
    try {
      setPlayerInactive(false);
      const status = await httpService.get(`/spotify/player-status`);
      if (status.emptyResponse) {
        setPlayerInactive(true);
        return;
      }
      await httpService.put(`/spotify/player-shuffle/false`);
      await httpService.put(`/spotify/player-pause`);

      for (let index = 0; index < albumData.tracks.items.length; index += 1) {
        httpService.post(
          `/spotify/queue-track/${encodeURI(albumData.tracks.items[index].uri)}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTrackPlayClick = async (index) => {
    try {
      setPlayerInactive(false);
      const status = await httpService.get(`/spotify/player-status`);
      if (status.emptyResponse) {
        setPlayerInactive(true);
        return;
      }
      await httpService.put(`/spotify/player-shuffle/false`);
      await httpService.put(`/spotify/player-pause`);

      await httpService.post(
        `/spotify/queue-track/${encodeURI(albumData.tracks.items[index].uri)}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleArtistClick = () => {
    if (albumData.artists) {
      setGridData({ totalCount: 0, data: [] });
      resetListData();
      setRelatedTo('');
      setLoading(true);
      setItem(albumData.artists[0].id);
      setType(ContextType.Artists);
    }
  };

  const DiscBlock = (discNumber, trackIndexOffset) => (
    <Grid columns={2}>
      {discTracks.length > 1 && (
        <Header size="small" className="disc-number-header" style={theme}>
          Disc 
          {' '}
          {discNumber + 1}
        </Header>
      )}
      <Grid.Row>
        <Grid.Column>
          <AlbumGridColumn
            tracks={leftSideTracks[discNumber]}
            trackHearts={trackHearts}
            trackIndexOffset={trackIndexOffset}
            handleTrackHeartClick={handleTrackHeartClick}
            handleTrackPlayClick={handleTrackPlayClick}
          />
        </Grid.Column>
        <Grid.Column>
          <AlbumGridColumn
            tracks={rightSideTracks[discNumber]}
            trackHearts={trackHearts}
            trackIndexOffset={trackIndexOffset}
            handleTrackHeartClick={handleTrackHeartClick}
            handleTrackPlayClick={handleTrackPlayClick}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );

  return (
    <Modal
      trigger={(
        <div>
          <Image
            size={useMiniImage ? 'mini' : ''}
            style={{ cursor: 'pointer' }}
            src={image}
            onClick={() => handleModalOpen()}
          />
        </div>
      )}
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <Modal.Header style={theme}>
        {headerTitle}
        <Icon
          name={albumHeart ? 'heart' : 'heart outline'}
          size="small"
          color="red"
          onClick={() => handleAlbumHeartClick(albumHeart)}
        />
        <Icon name="play" size="small" color="green" onClick={() => handlePlayAlbum()} />
        {playerInactive && <span style={{ float: 'right' }}>Player is inactive</span>}
      </Modal.Header>
      <Modal.Content image style={theme}>
        <Image wrapped src={albumData.images && getImage(albumData.images)} />
        <Modal.Description style={{ width: '80%' }}>
          <Header
            style={{ ...theme, paddingBottom: '10px', cursor: 'pointer' }}
            onClick={() => handleArtistClick()}
          >
            {albumData.artists && albumData.artists[0].name}
          </Header>
          {discTracks &&
            discTracks.map((item, index) => DiscBlock(index, getTrackIndexOffset(index)))}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

ModalAlbum.propTypes = {
  albumId: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  useMiniImage: PropTypes.bool,
  setType: PropTypes.func.isRequired,
  setItem: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  resetListData: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

ModalAlbum.defaultProps = {
  useMiniImage: false,
};

const mapDispatchToProps = (dispatch) => ({
  setType: (type) => dispatch(setContextType(type)),
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  resetListData: () => dispatch(resetContextListData()),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(null, mapDispatchToProps)(ModalAlbum);
