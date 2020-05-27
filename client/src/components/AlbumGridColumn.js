import { Grid, Icon } from 'semantic-ui-react';
import { msToSongTime } from '../util/utilities';
import React from 'react';
import PropTypes from 'prop-types';

const AlbumGridColumn = ({
  tracks,
  trackHearts,
  trackHeartOffset,
  handleTrackHeartClick,
}) => {
  console.log('AlbumGridColumn trackHeartOffset', trackHeartOffset);
  return (
    <Grid columns={3}>
      {tracks.map((item) => (
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
                trackHearts[trackHeartOffset + item.track_number - 1]
                  ? 'heart'
                  : 'heart outline'
              }
              size="small"
              color="red"
              onClick={() =>
                handleTrackHeartClick(
                  item.id,
                  trackHeartOffset + item.track_number - 1,
                  trackHearts[trackHeartOffset + item.track_number - 1]
                )
              }
            />
          </Grid.Column>
        </Grid.Row>
      ))}
    </Grid>
  );
};

AlbumGridColumn.propTypes = {
  tracks: PropTypes.array.isRequired,
  trackHearts: PropTypes.array.isRequired,
  handleTrackHeartClick: PropTypes.func.isRequired,
};

export default AlbumGridColumn;
