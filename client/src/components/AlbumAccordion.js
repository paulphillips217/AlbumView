import React from 'react';
import '../styles/App.css';
import { Image, Accordion, Segment } from 'semantic-ui-react';
import ModalAlbum from './ModalAlbum';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';

const AlbumAccordion = ({
  activeIndex,
  index,
  item,
  handleAccordionClick,
  httpService,
}) => {
  const theme = useTheme();

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
        <div style={theme}>
          {!!item.artist && <div>{item.artist}</div>}
          {item.name || item.albumName}
        </div>
      </Accordion.Title>
      <Accordion.Content active={activeIndex === index}>
        <p className={'album-details'}>
          <TrackDisplay />
          <ModalAlbum albumId={item.albumId} httpService={httpService} />
        </p>
      </Accordion.Content>
    </Accordion>
  );
};

AlbumAccordion.propTypes = {
  activeIndex: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  httpService: PropTypes.object.isRequired,
  handleAccordionClick: PropTypes.func.isRequired,
};

export default AlbumAccordion;
