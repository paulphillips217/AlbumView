import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Grid, Header } from 'semantic-ui-react';
import { filterByAlbumType } from '../util/utilities';
import { getContextType, getContextGridColumns } from '../store/selectors';
import { ContextType } from '../store/types';
import ModalAlbum from './ModalAlbum';
import HttpService from '../util/httpUtils';

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
      {contextGridData.data.map((e, index) => GridItem(e, index))}
    </Grid>
  );

  const ArtistAlbumType = ({ category, title }) => {
    if (contextGridData.data.some((item) => filterByAlbumType(item, category))) {
      return (
        <>
          <Header as="h2" floated="left" style={{ ...theme, paddingTop: '50px' }}>
            {title}
          </Header>
          <Grid columns={contextGridColumns} style={{ width: '100%' }}>
            {contextGridData.data
              .filter((item) => filterByAlbumType(item, category))
              .map((e, index) => GridItem(e, index))}
          </Grid>
        </>
      );
    }
    return '';
  };

  const ArtistAlbumGrid = () => (
    <>
      <ArtistAlbumType category="album" title="Albums" />
      <ArtistAlbumType category="single" title="Singles" />
      <ArtistAlbumType category="compilation" title="Compilations" />
      <ArtistAlbumType category="appears_on" title="Appears On" />
    </>
  );

  const useArtistAlbumGrid =
    contextType === ContextType.Artists || contextType === ContextType.RelatedArtists;

  return (
    <div className="grid-container">
      {useArtistAlbumGrid && contextGridData.data.length > 0 ? <ArtistAlbumGrid /> : ''}
      {!useArtistAlbumGrid && contextGridData.data.length > 0 ? <AlbumGrid /> : ''}
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextGridData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.string,
      })
    ),
  }).isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextGridColumns: getContextGridColumns(state),
});

export default connect(mapStateToProps)(ContextGrid);
