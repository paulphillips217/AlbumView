import { createLocalAlbumTracks } from './localFileUtils';
import moment from 'moment';
import { sortGridData } from './sortUtils';

export const getImage = (images) => {
  if (images == null || !images.length) {
    return '';
  }
  // if we have an image with medium height take that one
  let image = images.find((i) => i.height === 300);
  // otherwise, take the one with the largest image
  if (image == null) {
    image = images.find((i) => i.height > 300);
  }
  // otherwise take the first one
  if (image == null) {
    image = images[0];
  }
  if (image == null) {
    return '';
  }
  return image.url;
};

export const msToSongTime = (duration) => {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours > 0 ? hours + ':' : '';
  minutes = hours && minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + minutes + ':' + seconds;
};

export const filterByAlbumType = (album, type) => {
  if (album.albumGroup) {
    return album.albumGroup === type;
  }
  return album.albumType === type;
};

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const getUserAlbums = async (
  contextSortType,
  genre,
  localFileData,
  httpService
) => {
  console.log('getUserAlbums fetching data');
  try {
    const rawData = await httpService.get(`/album-view/album-list-fetch/${genre}`);
    // console.log('albumContext saved album data', rawData);
    const theAlbumArray = createLocalAlbumTracks(localFileData);
    console.log('AlbumContext.getGridData got theAlbumArray', theAlbumArray);
    if (rawData && rawData.length > 0) {
      const data = rawData.map((item) => ({
        albumId: item.albumId,
        spotifyAlbumId: item.spotifyAlbumId ? item.spotifyAlbumId : '',
        localId: item.localId ? item.localId : 0,
        oneDriveId: item.oneDriveId ? item.oneDriveId : '',
        albumName: item.albumName ? item.albumName : 'unknown album',
        artistName: item.artistName ? item.artistName : 'unknown artist',
        image: item.imageUrl,
        releaseDate: item.releaseDate ? moment(item.releaseDate).valueOf() : Date.now(),
        tracks: theAlbumArray.find((a) => a.localId === item.localId)?.tracks,
      }));
      return sortGridData(data, contextSortType);
    }
  } catch (err) {
    console.error('getUserAlbums error', err.name, err.message);
  }
  return [];
};
