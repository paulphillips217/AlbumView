import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Grid, Header, Image, Icon, Menu, Card, Item } from 'semantic-ui-react';
import { filterByAlbumType } from '../util/utilities';
import {
  getContextType,
  getContextGridColumns,
  getContextItem,
} from '../store/selectors';
import { ContextType } from '../store/types';
import ModalAlbum from './ModalAlbum';
import HttpService from '../util/httpUtils';
import { setSelectedAlbumId, setSelectedSpotifyAlbumId } from '../store/actions';

const ContextGrid = ({
  contextType,
  contextItem,
  contextGridData,
  contextGridColumns,
  setAlbumId,
  setSpotifyAlbumId,
  httpService,
}) => {
  const theme = useTheme();
  const [activeMenuItem, setActiveMenuItem] = useState(0);
  const [aboutArtistData, setAboutArtistData] = useState({});

  const useArtistGrid =
    contextType === ContextType.Artists || contextType === ContextType.RelatedArtists;

  useEffect(() => {
    if (contextItem) {
      httpService
        .get(`/album-view/artist-wiki/${contextItem}`)
        .then((rawData) => {
          console.log('artist wiki data', rawData);
          if (rawData && rawData.artists) {
            setAboutArtistData(rawData.artists[0]);
          } else {
            setAboutArtistData({});
          }
        })
        .catch((error) => console.log(error));
    }
  }, [httpService, contextItem, setAboutArtistData]);

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
  };

  const selectMenuItem = (menuItem) => {
    setActiveMenuItem(menuItem);
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

  const ArtistMenu = () => (
    <Menu pointing secondary>
      <Menu.Item
        name="albums"
        active={activeMenuItem === 0}
        onClick={() => selectMenuItem(0)}
      />
      <Menu.Item
        name="about"
        active={activeMenuItem === 1}
        onClick={() => selectMenuItem(1)}
      />
    </Menu>
  );

  const ArtistGrid = () => (
    <>
      <ArtistMenu />
      <ArtistAlbumGrid />
    </>
  );

  const ArtistWiki = () => {
    const paragraphs = aboutArtistData.strBiographyEN
      ? aboutArtistData.strBiographyEN.split('\n')
      : ['No Article Available'];

    return (
      <>
        <ArtistMenu />
        <Card centered raised fluid>
          {aboutArtistData.strArtistBanner && (
            <Image src={aboutArtistData.strArtistBanner} wrapped ui={false} />
          )}
          <Card.Content textAlign={'left'}>
            {aboutArtistData.strStyle && (
              <p>
                <strong>Style:</strong> {aboutArtistData.strStyle}
              </p>
            )}
            {aboutArtistData.strGenre && (
              <p>
                <strong>Genre:</strong> {aboutArtistData.strGenre}
              </p>
            )}
            {aboutArtistData.strMood && (
              <p>
                <strong>Mood:</strong> {aboutArtistData.strMood}
              </p>
            )}

            {aboutArtistData.strArtistThumb && (
              <Image src={aboutArtistData.strArtistThumb} wrapped ui={false} />
            )}

            {paragraphs.map((p) => (
              <Item style={{ marginTop: '10px' }}>
                <Item.Content content={p} />
              </Item>
            ))}
            {aboutArtistData.strArtist && (
              <Item style={{ marginTop: '10px' }}>
                <Item.Content>
                  <a
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(
                      aboutArtistData.strArtist
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Wikipedia Article
                  </a>
                </Item.Content>
              </Item>
            )}
          </Card.Content>
        </Card>
      </>
    );
  };

  return (
    <div className="grid-container">
      {useArtistGrid && activeMenuItem === 0 && contextGridData.data.length > 0 ? (
        <ArtistGrid />
      ) : (
        ''
      )}
      {!useArtistGrid && contextGridData.data.length > 0 ? <AlbumGrid /> : ''}
      {useArtistGrid && activeMenuItem === 1 && <ArtistWiki />}
      <ModalAlbum httpService={httpService} />
    </div>
  );
};

ContextGrid.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextItem: PropTypes.string.isRequired,
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
  contextItem: getContextItem(state),
  contextGridColumns: getContextGridColumns(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumId: (id) => dispatch(setSelectedAlbumId(id)),
  setSpotifyAlbumId: (id) => dispatch(setSelectedSpotifyAlbumId(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextGrid);
