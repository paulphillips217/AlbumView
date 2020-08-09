import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Button, Grid } from 'semantic-ui-react';
import {
  getContextSortType,
  getSavedAlbumData,
  getSpotifyAuthenticationState,
} from '../store/selectors';
import { getImage } from '../util/utilities';
import { SortTypes } from '../store/types';
import { sortGridData } from '../util/sortUtils';
import ModalAlbum from './ModalAlbum';
import ModalFileAlbum from './ModalFileAlbum';
import HttpService from '../util/httpUtils';
import { setSavedAlbumData } from '../store/actions';
import { blendAlbumLists } from '../util/localFileUtils';

const FileAnalysis = ({
  isSpotifyAuthenticated,
  albumFileIdProp,
  savedAlbumData,
  contextSortType,
  folderPicker,
  readAlbumArray,
  createTracks,
  tearDownTracks,
  setAlbumData,
  httpService,
}) => {
  const theme = useTheme();
  const [fileData, setFileData] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [searchResultData, setSearchResultData] = useState([]);
  const [hideMatches, setHideMatches] = useState(false);

  const handleRead = async () => {
    if (fileData && fileData.length > 0) {
      const theAlbumArray = await readAlbumArray(fileData);
      console.log('handleRead got theAlbumArray', theAlbumArray);
      setAlbums(theAlbumArray);
      blendAlbumLists(
        theAlbumArray,
        albumFileIdProp,
        savedAlbumData,
        savedAlbumData.spotifyCount,
        savedAlbumData.offset,
        contextSortType,
        setAlbumData
      );
    } else {
      console.log('file import data is empty');
    }
  };

  const handleSearch = (item) => {
    console.log('handle search: ', item);
    const query = `album:${encodeURIComponent(
      item.albumName
    )}+artist:${encodeURIComponent(item.artist)}`;
    httpService
      .get(`/spotify/search/${query}/album`)
      .then((rawData) => {
        console.log('local file search rawData', rawData);
        let data;
        if (rawData.albums.items.length === 0) {
          data = [{ [albumFileIdProp]: item[albumFileIdProp], albumId: '' }];
        } else {
          data = rawData.albums.items.map((e) => ({
            [albumFileIdProp]: item[albumFileIdProp],
            albumId: e.id,
            albumName: e.name,
            artist: e.artists[0] ? e.artists[0].name : 'unknown artist',
            image: getImage(e.images),
          }));
        }
        const newData = searchResultData.concat(data);
        console.log('local file search newData', newData);
        setSearchResultData(newData);
      })
      .catch((error) => console.log(error));
  };

  const setUpTracks = (albumFileId) => {
    const album = albums.find((a) => albumFileId === a[albumFileIdProp]);
    return createTracks(album, httpService);
  };

  const gridItemSearchButton = (item) => {
    if (isSpotifyAuthenticated) {
      return <Button onClick={() => handleSearch(item)}>Search</Button>;
    }
    return '';
  };

  const gridItemSearchResults = (item) => {
    return searchResultData
      .filter((result) => result[albumFileIdProp] === item[albumFileIdProp])
      .map((result) =>
        result.albumId ? (
          <div>
            <ModalAlbum
              albumId={result.albumId}
              artistName={result.artist}
              albumName={result.albumName}
              image={result.image}
              useMiniImage
              httpService={httpService}
            />
            <div style={theme}>
              {!!result.artist && <div>{result.artist}</div>}
              {result.albumName}
            </div>
          </div>
        ) : (
          <div>No Results</div>
        )
      );
  };

  const gridItemColor = (item) => {
    if (item[albumFileIdProp] && item.albumId) {
      return 'green';
    }
    if (item.albumId) {
      return 'blue';
    }
    return 'red';
  };

  const GridItem = (item, index) => (
    <Grid.Row columns={4} key={index} style={{ ...theme, color: gridItemColor(item) }}>
      <Grid.Column>
        {item[albumFileIdProp] ? (
          <ModalFileAlbum
            albumFileId={item[albumFileIdProp]}
            artistName={item.artist}
            albumName={item.albumName}
            setUpTracks={setUpTracks}
            tearDownTracks={tearDownTracks}
            httpService={httpService}
          />
        ) : (
          ''
        )}
      </Grid.Column>
      <Grid.Column>{item[albumFileIdProp] ? item.albumName : ''}</Grid.Column>
      <Grid.Column>{item.albumId ? item.artist : gridItemSearchButton(item)}</Grid.Column>
      <Grid.Column>
        {item.albumId ? item.albumName : gridItemSearchResults(item)}
      </Grid.Column>
    </Grid.Row>
  );

  return (
    <div style={{ ...theme, paddingLeft: '20px' }}>
      {!fileData.length &&
        !albums.length &&
        React.createElement(folderPicker, { setFileData, httpService }, null)}
      {fileData.length > 0 && !albums.length && (
        <Button onClick={handleRead}>Read Files</Button>
      )}
      {albums.length > 0 && (
        <Button onClick={() => setHideMatches(!hideMatches)}>
          {hideMatches ? 'Show Matches' : 'Hide Matches'}
        </Button>
      )}
      {albums.length > 0 && savedAlbumData.data.length > 0 && (
        <Grid celled centered style={{ width: '80%' }}>
          <Grid.Row columns={2} style={theme}>
            <Grid.Column>
              <strong>Local Album Library</strong>
            </Grid.Column>
            <Grid.Column>
              <strong>Spotify Album Library</strong>
            </Grid.Column>
          </Grid.Row>
          {sortGridData(savedAlbumData.data, SortTypes.ArtistThenAlbumName)
            .filter((item) => !(hideMatches && item[albumFileIdProp] && item.albumId))
            .map((item, index) => GridItem(item, index))}
        </Grid>
      )}
    </div>
  );
};

FileAnalysis.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  albumFileIdProp: PropTypes.string.isRequired,
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    offset: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
      })
    ),
  }).isRequired,
  folderPicker: PropTypes.elementType.isRequired,
  contextSortType: PropTypes.string.isRequired,
  readAlbumArray: PropTypes.func.isRequired,
  createTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyAuthenticationState(state),
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FileAnalysis);
