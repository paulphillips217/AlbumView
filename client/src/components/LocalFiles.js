import React, { Fragment, useEffect, useState } from 'react';
import { Button, Grid, Header } from 'semantic-ui-react';
import '../styles/App.css';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import {
  getContextGridColumns,
  getContextGridData,
  getContextGridMore,
  getContextGridOffset,
  getDataLoading,
} from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextGridType,
  setDataLoading,
} from '../store/actions';
import { connect } from 'react-redux';
import { getImage } from '../util/utilities';
import { GridDataType, SortTypes, SPOTIFY_PAGE_LIMIT } from '../store/types';
import { cleanTitle, sortGridData } from '../util/sortUtils';
import ModalAlbum from './ModalAlbum';

const LocalFiles = ({
  dataLoading,
  contextGridData,
  contextGridOffset,
  contextGridMore,
  setContextGridData,
  setContextGridType,
  setContextGridOffset,
  setContextGridMore,
  setDataLoading,
  httpService,
}) => {
  const theme = useTheme();
  const [fileData, setFileData] = useState({});
  const [albums, setAlbums] = useState([]);
  const [albumGridData, setAlbumGridData] = useState([]);
  const [searchResultData, setSearchResultData] = useState([]);

  useEffect(() => {
    const getGridData = () => {
      if (!dataLoading) {
        return;
      }
      httpService
        .get(`/album-list/${contextGridOffset}/${SPOTIFY_PAGE_LIMIT}`)
        .then((rawData) => {
          console.log('saved album data', rawData, contextGridOffset);
          const data = rawData.items.map((e) => ({
            albumId: e.album.id,
            albumName: e.album.name,
            artist: e.album.artists[0]
              ? e.album.artists[0].name
              : 'unknown artist',
            image: getImage(e.album.images),
            releaseDate: e.album.release_date,
          }));
          const newData = contextGridOffset
            ? contextGridData.concat(data)
            : data;
          setContextGridData(newData);
          setContextGridType(GridDataType.Album);
          setContextGridMore(!!rawData.next);
          if (!rawData.next) {
            blendAlbumLists(albums, newData);
            setDataLoading(false);
          }
        })
        .catch((error) => console.log(error));
    };
    getGridData();
  }, [contextGridOffset]);

  useEffect(() => {
    // get all the pages in the background
    if (
      dataLoading &&
      contextGridOffset < contextGridData.length &&
      contextGridMore
    ) {
      setContextGridOffset(contextGridData.length);
    }
  }, [dataLoading, contextGridData, contextGridOffset, contextGridMore]);

  //  useEffect(() => console.log('updating search results'), [searchResultData]);

  const onFileChange = (e) => {
    setFileData(e.target.files);
  };

  const handleRead = () => {
    const theAlbumArray = [];
    if (fileData && fileData.length > 0) {
      Object.keys(fileData).forEach((key, index) => {
        const item = fileData[key];
        const splitPath = item.webkitRelativePath.split('/');
        const artist =
          splitPath.length >= 3 ? splitPath[splitPath.length - 3] : 'invalid';
        const albumName =
          splitPath.length >= 3 ? splitPath[splitPath.length - 2] : 'invalid';
        if (
          artist &&
          albumName &&
          item.type.includes('audio') &&
          !theAlbumArray.some(
            (a) =>
              a.artist &&
              a.artist === artist &&
              a.albumName &&
              a.albumName === albumName
          )
        ) {
          theAlbumArray.push({
            artist: artist,
            albumName: albumName,
            index,
          });
        }
      });
      console.log('read local albums: ', theAlbumArray);
      setAlbums(theAlbumArray);
      blendAlbumLists(theAlbumArray, contextGridData);
    } else {
      console.log('file import data is empty');
    }
  };

  const blendAlbumLists = (localAlbumList, spotifyAlbumList) => {
    const blendedList = spotifyAlbumList.slice();
    localAlbumList.forEach((item) => {
      const matchIndex = blendedList.findIndex(
        (a) =>
          cleanTitle(a.artist) === cleanTitle(item.artist) &&
          cleanTitle(a.albumName) === cleanTitle(item.albumName)
      );
      if (matchIndex >= 0) {
        blendedList[matchIndex].index = item.index;
      } else {
        blendedList.push({
          artist: item.artist,
          albumName: item.albumName,
          index: item.index,
        });
      }
    });
    console.log('blended album list: ', blendedList);
    setAlbumGridData(blendedList);
  };

  const handleSearch = (item) => {
    console.log('handle search: ', item);
    const query = `album:${encodeURI(item.albumName)}+artist:${encodeURI(
      item.artist
    )}`;
    httpService
      .get(`/search/${query}/album`)
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
      <Grid.Column>{item.index ? item.artist : ''}</Grid.Column>
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
      {dataLoading && (
        <Header as="h3" style={{ ...theme, paddingTop: '50px' }}>
          Please wait ...
        </Header>
      )}
      {!dataLoading && !albums.length && (
        <Fragment>
          <Header as="h3" style={{ ...theme, paddingTop: '50px' }}>
            Select the directory that contains your album collection
          </Header>
          <input
            type="file"
            webkitdirectory=""
            mozdirectory=""
            directory=""
            style={{ ...theme, minHeight: '70px' }}
            onChange={onFileChange}
          />
        </Fragment>
      )}
      {fileData && fileData.length > 0 && !albums.length && (
        <Button onClick={handleRead}>Read Files</Button>
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
        {sortGridData(
          albumGridData,
          SortTypes.ArtistThenAlbumName
        ).map((item, index) => GridItem(item, index))}
      </Grid>
    </div>
  );
};

LocalFiles.propTypes = {
  contextGridData: PropTypes.array.isRequired,
  contextGridOffset: PropTypes.number.isRequired,
  contextGridMore: PropTypes.bool.isRequired,
  dataLoading: PropTypes.bool.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridType: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  contextGridColumns: getContextGridColumns(state),
  contextGridData: getContextGridData(state),
  contextGridOffset: getContextGridOffset(state),
  contextGridMore: getContextGridMore(state),
  dataLoading: getDataLoading(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridType: (type) => dispatch(setContextGridType(type)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LocalFiles);
