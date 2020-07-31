import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'semantic-ui-react';
import { msToSongTime } from '../util/utilities';

const AlbumGridColumn = ({
  tracks,
  trackHearts,
  trackIndexOffset,
  handleTrackHeartClick,
  handleTrackPlayClick,
}) => {
  console.log('AlbumGridColumn tracks', tracks);
  const getTrackColor = (item) => {
    if (typeof item.is_playable === 'undefined') {
      return 'gray';
    }
    return item.is_playable ? 'green' : 'red';
  };

  return (
    <Grid columns={3}>
      {tracks.map((item) => (
        <Grid.Row style={{ padding: '0px' }}>
          <Grid.Column
            style={{ width: '3rem', paddingLeft: '0.5rem', paddingRight: '0' }}
          >
            <Icon
              name={
                trackHearts[trackIndexOffset + item.track_number - 1]
                  ? 'heart'
                  : 'heart outline'
              }
              size="small"
              color="red"
              onClick={() =>
                handleTrackHeartClick(
                  item.id,
                  trackIndexOffset + item.track_number - 1,
                  trackHearts[trackIndexOffset + item.track_number - 1]
                )
              }
            />
            <Icon
              name="play"
              size="small"
              color={getTrackColor(item)}
              onClick={() =>
                handleTrackPlayClick(trackIndexOffset + item.track_number - 1)
              }
            />
          </Grid.Column>
          <Grid.Column
            style={{
              width: '1.5rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            }}
          >
            {item.track_number}
          </Grid.Column>
          <Grid.Column
            style={{
              width: 'calc(100% - 8.5rem)',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            }}
          >
            {item.name}
          </Grid.Column>
          <Grid.Column
            style={{
              width: '3rem',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
            }}
          >
            {msToSongTime(item.duration_ms)}
          </Grid.Column>
        </Grid.Row>
      ))}
    </Grid>
  );
};

AlbumGridColumn.propTypes = {
  tracks: PropTypes.array.isRequired,
  trackHearts: PropTypes.array.isRequired,
  trackIndexOffset: PropTypes.number.isRequired,
  handleTrackHeartClick: PropTypes.func.isRequired,
  handleTrackPlayClick: PropTypes.func.isRequired,
};

export default AlbumGridColumn;
