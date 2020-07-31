import React, { useState } from 'react';
import { Button, Grid } from 'semantic-ui-react';
import '../styles/App.css';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import { getSavedAlbumData, getSpotifyAuthenticationState } from '../store/selectors';
import { connect } from 'react-redux';
import { getImage } from '../util/utilities';
import { SortTypes } from '../store/types';
import { cleanTitle, sortGridData } from '../util/sortUtils';
import ModalAlbum from './ModalAlbum';
import ModalFileAlbum from './ModalFileAlbum';

const FileAnalysis = ({
  isSpotifyAuthenticated,
  savedAlbumData,
  folderPicker,
  readAlbumArray,
  createTracks,
  tearDownTracks,
  httpService,
}) => {
  const theme = useTheme();
  const [fileData, setFileData] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [albumGridData, setAlbumGridData] = useState([]);
  const [searchResultData, setSearchResultData] = useState([]);
  const [hideMatches, setHideMatches] = useState(false);

  const handleRead = async () => {
    if (fileData && fileData.length > 0) {
      const theAlbumArray = await readAlbumArray(fileData);
      console.log('handleRead got theAlbumArray', theAlbumArray);
      setAlbums(theAlbumArray);
      blendAlbumLists(theAlbumArray, savedAlbumData.data);
    } else {
      console.log('file import data is empty');
    }
  };

  const blendAlbumLists = (localAlbumList, spotifyAlbumList) => {
    const blendedList = spotifyAlbumList.slice();
    if (localAlbumList && localAlbumList.length > 0) {
      localAlbumList.forEach((item) => {
        const matchIndex = blendedList.findIndex(
          (a) =>
            cleanTitle(a.artist) === cleanTitle(item.artist) &&
            cleanTitle(a.albumName) === cleanTitle(item.albumName)
        );
        if (matchIndex >= 0) {
          blendedList[matchIndex].index = item.index;
          blendedList[matchIndex].tracks = item.tracks;
        } else {
          blendedList.push({
            artist: item.artist,
            albumName: item.albumName,
            index: item.index,
            tracks: item.tracks,
          });
        }
      });
    }
    console.log('blended album list: ', blendedList);
    setAlbumGridData(blendedList);
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
        let data = [];
        if (rawData.albums.items.length === 0) {
          data = [{ index: item.index, albumId: '' }];
        } else {
          data = rawData.albums.items.map((e) => ({
            index: item.index,
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

  const setUpTracks = (index) => {
    const album = albums.find((a) => index === a.index);
    return createTracks(album, fileData);
  };

  const gridItemSearchButton = (item) => {
    if (isSpotifyAuthenticated) {
      return <Button onClick={() => handleSearch(item)}>Search</Button>;
    }
  };

  const gridItemSearchResults = (item) => {
    return searchResultData
      .filter((result) => result.index === item.index)
      .map((result) =>
        result.albumId ? (
          <div>
            <ModalAlbum
              albumId={result.albumId}
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
    if (item.index && item.albumId) {
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
        {item.index ? (
          <ModalFileAlbum
            albumIndex={item.index}
            artistName={item.artist}
            albumName={item.albumName}
            setUpTracks={setUpTracks}
            tearDownTracks={tearDownTracks}
            httpService={httpService}
          />
        ) : (
          <span>{item.artist}</span>
        )}
      </Grid.Column>
      <Grid.Column>{item.index ? item.albumName : ''}</Grid.Column>
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
      {fileData && fileData.length > 0 && !albums.length && (
        <Button onClick={handleRead}>Read Files</Button>
      )}
      {albums.length > 0 && (
        <Button onClick={() => setHideMatches(!hideMatches)}>
          {hideMatches ? 'Show Matches' : 'Hide Matches'}
        </Button>
      )}
      {albumGridData.length > 0 && (
        <Grid celled centered style={{ width: '80%' }}>
          <Grid.Row columns={2} style={theme}>
            <Grid.Column>
              <strong>Local Album Library</strong>
            </Grid.Column>
            <Grid.Column>
              <strong>Spotify Album Library</strong>
            </Grid.Column>
          </Grid.Row>
          {sortGridData(albumGridData, SortTypes.ArtistThenAlbumName)
            .filter((item) => !(hideMatches && item.index && item.albumId))
            .map((item, index) => GridItem(item, index))}
        </Grid>
      )}
    </div>
  );
};

FileAnalysis.propTypes = {
  isSpotifyAuthenticated: PropTypes.bool.isRequired,
  savedAlbumData: PropTypes.object.isRequired,
  readAlbumArray: PropTypes.func.isRequired,
  setUpTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyAuthenticationState(state),
  savedAlbumData: getSavedAlbumData(state),
});

export default connect(mapStateToProps)(FileAnalysis);
