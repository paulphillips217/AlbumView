import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Button, Grid } from 'semantic-ui-react';
import {
  getContextSortType,
  getSavedAlbumData,
  getSpotifyIsAuthenticated,
} from '../store/selectors';
import { getImage } from '../util/utilities';
import { SortTypes } from '../store/types';
import { sortGridData } from '../util/sortUtils';
import ModalAlbumDeprecated from './ModalAlbumDeprecated';
import ModalFileAlbum from './ModalFileAlbum';
import HttpService from '../util/httpUtils';
import { setSavedAlbumData } from '../store/actions';

const FileAnalysis = ({
  isSpotifyAuthenticated,
  albumFileIdProp,
  savedAlbumData,
  contextSortType,
  folderPicker,
  localFileData,
  readAlbumArray,
  createTracks,
  tearDownTracks,
  setAlbumData,
  setLocalFileData,
  httpService,
}) => {
  const theme = useTheme();
  const [searchResultData, setSearchResultData] = useState([]);
  const [hideMatches, setHideMatches] = useState(false);

  const handleRead = async () => {
    if (localFileData && localFileData.length > 0) {
      const theAlbumArray = await readAlbumArray(localFileData);
      console.log('handleRead got theAlbumArray', theAlbumArray);
      const sendArray = theAlbumArray.map((item) => ({
        localId: item.localId ? item.localId : -1,
        oneDriveId: item.oneDriveId ? item.oneDriveId : '',
        artistName: item.artistName,
        albumName: item.albumName,
      }));
      // console.log('handleRead sendArray', sendArray);
      const rawData = await httpService.post(`/album-view/user-owned-albums`, {
        albums: sendArray,
      });
      console.log('user owned albums return rawData', rawData);
      const data = rawData.map((item) => ({
        albumId: item.albumId,
        spotifyAlbumId: item.spotifyAlbumId ? item.spotifyAlbumId : '',
        albumName: item.albumName ? item.albumName : 'unknown album',
        artistName: item.artistName ? item.artistName : 'unknown artist',
        image: item.imageUrl,
        releaseDate: item.releaseDate ? moment(item.releaseDate).valueOf() : Date.now(),
        localId: item.localId ? item.localId : null,
        oneDriveId: item.oneDriveId ? item.oneDriveId : '',
        tracks: theAlbumArray.find((a) => a.localId === item.localId)?.tracks,
      }));
      // console.log('user owned albums return data', data);
      const sortedData = sortGridData(data, contextSortType);
      console.log('saving data');
      setAlbumData({
        spotifyCount: savedAlbumData.spotifyCount,
        data: sortedData,
      });

      // blendAlbumLists(
      //   theAlbumArray,
      //   albumFileIdProp,
      //   savedAlbumData,
      //   savedAlbumData.spotifyCount,
      //   contextSortType,
      //   setAlbumData
      // );
    } else {
      console.log('file import data is empty');
    }
  };

  const handleSearch = (item) => {
    console.log('handle search: ', item);
    const query = `album:${encodeURIComponent(
      item.albumName
    )}+artist:${encodeURIComponent(item.artistName)}`;
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
            spotifyAlbumId: e.id,
            albumName: e.name,
            artistName: e.artists[0] ? e.artists[0].name : 'unknown artist',
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
    const album = savedAlbumData.data.find(
      (item) => item[albumFileIdProp] === albumFileId
    );
    console.log('FileAnalysis.setUpTracks album: ', albumFileIdProp, albumFileId, album);
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
        result.spotifyAlbumId ? (
          <div>
            <ModalAlbumDeprecated
              spotifyAlbumId={result.spotifyAlbumId}
              artistName={result.artistName}
              albumName={result.albumName}
              image={result.image}
              useMiniImage
              httpService={httpService}
            />
            <div style={theme}>
              {!!result.artistName && <div>{result.artistName}</div>}
              {result.albumName}
            </div>
          </div>
        ) : (
          <div>No Results</div>
        )
      );
  };

  const gridItemColor = (item) => {
    if (item[albumFileIdProp] && item.spotifyAlbumId) {
      return 'green';
    }
    if (item.spotifyAlbumId) {
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
            artistName={item.artistName}
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
      <Grid.Column>
        {item.spotifyAlbumId ? item.artistName : gridItemSearchButton(item)}
      </Grid.Column>
      <Grid.Column>
        {item.spotifyAlbumId ? item.albumName : gridItemSearchResults(item)}
      </Grid.Column>
    </Grid.Row>
  );

  const anyLocalAlbums = savedAlbumData.data.some(
    (album) =>
      !!album[albumFileIdProp] &&
      ((albumFileIdProp === 'localId' && album?.tracks?.length > 0) ||
        albumFileIdProp !== 'localId')
  );

  console.log('localFileData in FileAnalysis is: ', localFileData);

  return (
    <div style={{ ...theme, paddingLeft: '20px' }}>
      {!localFileData.length &&
        React.createElement(folderPicker, { setLocalFileData, httpService }, null)}
      {localFileData.length > 0 && !anyLocalAlbums && (
        <Button onClick={handleRead}>Read Files</Button>
      )}
      {localFileData.length > 0 && anyLocalAlbums && (
        <Button onClick={() => setHideMatches(!hideMatches)}>
          {hideMatches ? 'Show Matches' : 'Hide Matches'}
        </Button>
      )}
      {localFileData.length > 0 && anyLocalAlbums && savedAlbumData.data.length > 0 && (
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
            .filter(
              (item) => !(hideMatches && item[albumFileIdProp] && item.spotifyAlbumId)
            )
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
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  folderPicker: PropTypes.elementType.isRequired,
  localFileData: PropTypes.any.isRequired,
  contextSortType: PropTypes.string.isRequired,
  readAlbumArray: PropTypes.func.isRequired,
  createTracks: PropTypes.func.isRequired,
  tearDownTracks: PropTypes.func.isRequired,
  setAlbumData: PropTypes.func.isRequired,
  setLocalFileData: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isSpotifyAuthenticated: getSpotifyIsAuthenticated(state),
  savedAlbumData: getSavedAlbumData(state),
  contextSortType: getContextSortType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAlbumData: (data) => dispatch(setSavedAlbumData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FileAnalysis);
