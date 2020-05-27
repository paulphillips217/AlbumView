import React from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Image, Accordion } from 'semantic-ui-react';
import ModalAlbum from './ModalAlbum';
import PropTypes from 'prop-types';
import httpService from '../util/httpUtils';
import { GridDataType } from '../store/types';

const AlbumAccordion = ({
  activeIndex,
  index,
  item,
  gridDataType,
  handleAccordionClick,
  httpService,
}) => {
  const handleQueueClick = (uri) => {
    console.log('handleQueueClick: ' + encodeURI(uri));
    httpService
      .post(`/queue-track/${encodeURI(uri)}`)
      .catch((error) => console.log(error));
  };

  const TrackDisplay = () => (
    <div>
      <strong>Track</strong>: {item.name}
      <br />
      <strong>Artist</strong>: {item.artist}
      <br />
      <strong>Album</strong>: {item.albumName}
      <br />
      <a href={`http://open.spotify.com/track/${item.id}`}>Open in Player</a>
      <br />
      <button
        style={{ width: '95%' }}
        value={item.uri}
        onClick={() => handleQueueClick(item.uri)}
      >
        Queue Track
      </button>
      <br />
    </div>
  );

  return (
    <Accordion>
      <Accordion.Title
        active={activeIndex === index}
        index={index}
        onClick={() => handleAccordionClick(index)}
      >
        <Image src={item.image} />
        <p>{!!item.artist && <div>{item.artist}</div>}
        {item.name || item.albumName}</p>
      </Accordion.Title>
      <Accordion.Content active={activeIndex === index}>
        <p className={'album-details'}>
          {gridDataType === GridDataType.Track && <TrackDisplay />}
          <ModalAlbum albumId={item.albumId} />
        </p>
      </Accordion.Content>
    </Accordion>
  );
};

AlbumAccordion.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  gridDataType: PropTypes.string.isRequired,
  isTrack: PropTypes.bool.isRequired,
  handleAccordionClick: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, null, mergeProps)(AlbumAccordion);
