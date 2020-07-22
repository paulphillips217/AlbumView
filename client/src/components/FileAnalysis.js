import React, { useState } from 'react';
import { Button, Grid } from 'semantic-ui-react';
import '../styles/App.css';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import { getSavedAlbumData } from '../store/selectors';
import { connect } from 'react-redux';
import { getImage } from '../util/utilities';
import { SortTypes } from '../store/types';
import { cleanTitle, sortGridData } from '../util/sortUtils';
import ModalAlbum from './ModalAlbum';
import ModalLocalAlbum from './ModalLocalAlbum';
import LocalFolderPicker from './LocalFolderPicker';
import OneDriveFileContext from './OneDriveContext';

const FileAnalysis = ({
  savedAlbumData,
  folderPicker,
  readAlbumArray,
  httpService,
}) => {
  const theme = useTheme();
  const [fileData, setFileData] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [albumGridData, setAlbumGridData] = useState([]);
  const [searchResultData, setSearchResultData] = useState([]);
  const [hideMatches, setHideMatches] = useState(false);

  const handleRead = () => {
    if (fileData && fileData.length > 0) {
      const theAlbumArray = readAlbumArray(fileData);
      setAlbums(theAlbumArray);
      blendAlbumLists(theAlbumArray, savedAlbumData);
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
    const query = `album:${encodeURI(item.albumName)}+artist:${encodeURI(
      item.artist
    )}`;
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

  const gridItemSearchButton = (item) => (
    <Button onClick={() => handleSearch(item)}>Search</Button>
  );

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
    <Grid.Row
      columns={4}
      key={index}
      style={{ ...theme, color: gridItemColor(item) }}
    >
      <Grid.Column>
        {item.index ? (
          <ModalLocalAlbum
            httpService={httpService}
            artistName={item.artist}
            albumName={item.albumName}
            tracks={item.tracks}
            fileData={fileData}
          />
        ) : (
          ''
        )}
      </Grid.Column>
      <Grid.Column>{item.index ? item.albumName : ''}</Grid.Column>
      <Grid.Column>
        {item.albumId ? item.artist : gridItemSearchButton(item)}
      </Grid.Column>
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
      <Grid celled centered style={{ width: '80%' }}>
        <Grid.Row columns={2} style={theme}>
          <Grid.Column>
            <strong>Local Album Library</strong>
          </Grid.Column>
          <Grid.Column centered>
            <strong>Spotify Album Library</strong>
          </Grid.Column>
        </Grid.Row>
        {sortGridData(albumGridData, SortTypes.ArtistThenAlbumName).map(
          (item, index) => {
            if (!(hideMatches && item.index && item.albumId)) {
              return GridItem(item, index);
            }
          }
        )}
      </Grid>
    </div>
  );
};

FileAnalysis.propTypes = {
  savedAlbumData: PropTypes.array.isRequired,
  readAlbumArray: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
});

export default connect(mapStateToProps)(FileAnalysis);
