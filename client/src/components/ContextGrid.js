import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid, Header } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import { filterByAlbumType } from '../util/utilities';
import { getContextType, getContextGridColumns } from '../store/selectors';
import { ContextType } from '../store/types';
import PropTypes from 'prop-types';
import ModalAlbum from './ModalAlbum';

const ContextGrid = ({
  contextType,
  contextGridData,
  contextGridColumns,
  httpService,
}) => {
  const theme = useTheme();

  const GridItem = (item, index) => (
    <Grid.Column key={index}>
      <div style={theme}>
        <ModalAlbum albumId={item.albumId} image={item.image} httpService={httpService} />
        <div style={theme}>
          {!!item.artist && <div>{item.artist}</div>}
          {item.trackName || item.albumName}
        </div>
      </div>
    </Grid.Column>
  );

  const AlbumGrid = () => (
    <Grid columns={contextGridColumns} style={{ width: '100%' }}>
      {contextGridData.map((e, index) => GridItem(e, index))}
    </Grid>
  );

  const ArtistAlbumType = ({ category, title }) => {
    if (contextGridData.some((item) => filterByAlbumType(item, category))) {
      return (
        <Fragment>
          <Header as="h2" floated="left" style={{ ...theme, paddingTop: '50px' }}>
            {title}
          </Header>
          <Grid columns={contextGridColumns} style={{ width: '100%' }}>
            {contextGridData
              .filter((item) => filterByAlbumType(item, category))
              .map((e, index) => GridItem(e, index))}
          </Grid>
        </Fragment>
      );
    } else {
      return '';
    }
  };

  const ArtistAlbumGrid = () => (
    <Fragment>
      <ArtistAlbumType category={'album'} title={'Albums'} />
      <ArtistAlbumType category={'single'} title={'Singles'} />
      <ArtistAlbumType category={'compilation'} title={'Compilations'} />
      <ArtistAlbumType category={'appears_on'} title={'Appears On'} />
    </Fragment>
  );

  const useArtistAlbumGrid =
    contextType === ContextType.Artists || contextType === ContextType.RelatedArtists;

  return (
    <div className="grid-container">
      {useArtistAlbumGrid && contextGridData && contextGridData.length > 0 ? (
        <ArtistAlbumGrid />
      ) : (
        ''
      )}
      {!useArtistAlbumGrid && contextGridData && contextGridData.length > 0 ? (
        <AlbumGrid />
      ) : (
        ''
      )}
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextGridData: PropTypes.array.isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextGridColumns: getContextGridColumns(state),
});

export default connect(mapStateToProps)(ContextGrid);
