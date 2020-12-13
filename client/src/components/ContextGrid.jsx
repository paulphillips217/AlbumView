import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Grid, Header, Image, Icon } from 'semantic-ui-react';
import { filterByAlbumType } from '../util/utilities';
import { getContextType, getContextGridColumns } from '../store/selectors';
import { ContextType } from '../store/types';
import ModalAlbum from './ModalAlbum';
import HttpService from '../util/httpUtils';
import { setSelectedAlbumId, setSelectedSpotifyAlbumId } from '../store/actions';

const ContextGrid = ({
  contextType,
  contextGridData,
  contextGridColumns,
  setAlbumId,
  setSpotifyAlbumId,
  httpService,
}) => {
  const theme = useTheme();

  const selectAlbum = (item) => {
    if (item.albumId) {
      setAlbumId(item.albumId);
      setSpotifyAlbumId('');
      return;
    }
    if (item.spotifyAlbumId) {
      setSpotifyAlbumId(item.spotifyAlbumId);
      setAlbumId(0);
      return;
    }
    setAlbumId(0);
    setSpotifyAlbumId('');
    return;
  };

  const GridItem = (item, index) => (
    <Grid.Column key={index}>
      <div style={theme}>
        {item.image ? (
          <Image
            size="medium"
            style={{ cursor: 'pointer' }}
            src={item.image}
            onClick={() => selectAlbum(item)}
          />
        ) : (
          <Icon
            link
            name="file image outline"
            size="huge"
            onClick={() => selectAlbum(item)}
          />
        )}
        <div style={theme}>
          {!!item.artistName && <div>{item.artistName}</div>}
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
      <ModalAlbum httpService={httpService} />
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextGridData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  contextGridColumns: PropTypes.number.isRequired,
  setAlbumId: PropTypes.func.isRequired,
  setSpotifyAlbumId: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextGridColumns: getContextGridColumns(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumId: (id) => dispatch(setSelectedAlbumId(id)),
  setSpotifyAlbumId: (id) => dispatch(setSelectedSpotifyAlbumId(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextGrid);
