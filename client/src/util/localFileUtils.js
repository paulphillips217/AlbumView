import { trimTrackFileName } from './utilities';
import { cleanTitle, sortGridData } from './sortUtils';

export const createLocalTracks = (album) => {
  console.log('createLocalTracks');
  return album.localFileObjects.map((track) => ({
    name: trimTrackFileName(track.name),
    url: URL.createObjectURL(track),
  }));
};

export const tearDownLocalTracks = (albumTrackList) => {
  console.log('tearDownLocalTracks');
  albumTrackList.map((t) => URL.revokeObjectURL(t.url));
};

export const createOneDriveTracks = async (album, httpService) => {
  const trackList = await httpService.get(`/one-drive/children/${album.oneDriveId}`);
  console.log('createOneDriveTracks', trackList);
  return trackList
    .filter((t) => t.file.mimeType.includes('audio'))
    .map((t) => ({
      name: t.audio && t.audio.title ? t.audio.title : trimTrackFileName(t.name),
      url: t['@microsoft.graph.downloadUrl'],
    }));
};

export const tearDownOneDriveTracks = () => {
  console.log('tearDownOneDriveTracks');
};

// this is used to merged album lists.  The master list is savedAlbumData
// the mergeList can be spotify albums, local file albums, or oneDrive albums
export const blendAlbumLists = (
  mergeList,
  mergeListIdProp,
  savedAlbumData,
  spotifyCount,
  contextSortType,
  setAlbumData
) => {
  console.log('blend starting');
  // start with the spotify list and add any file albums to it
  const blendedList = savedAlbumData.data.slice();

  if (mergeList && mergeList.length > 0) {
    // loop through the file system albums
    mergeList.forEach((item) => {
      // match on artist & album name, but don't match if there are different valid id's
      // because there are multiple spotify album versions
      const matchIndex = blendedList.findIndex(
        (a) =>
          cleanTitle(a.artist) === cleanTitle(item.artist) &&
          cleanTitle(a.albumName) === cleanTitle(item.albumName) &&
          (a[mergeListIdProp] === item[mergeListIdProp] ||
            !a[mergeListIdProp] ||
            !item[mergeListIdProp])
      );
      // console.log('localFileObjects in blendAlbumLists', item.tracks);
      if (matchIndex >= 0) {
        // the album was found in the merge list, so it exists in both places
        // add the merge list id and the tracks array to the master list
        blendedList[matchIndex][mergeListIdProp] = item[mergeListIdProp];
        if (item.tracks && item.tracks.length > 0) {
          blendedList.localFileObjects = item.tracks;
        }
      } else {
        // the album isn't in the master list, so add it
        const album = {
          albumId: item.albumId ? item.albumId : null,
          [mergeListIdProp]: item[mergeListIdProp] ? item[mergeListIdProp] : null,
          albumName: item.albumName,
          artist: item.artist,
          image: item.image ? item.image : '',
          releaseDate: item.releaseDate ? item.releaseDate : '',
          localFileObjects: item.tracks && item.tracks.length > 0 ? item.tracks : null,
        };
        blendedList.push(album);
        // console.log('blendAlbumLists added album: ', album);
      }
    });
  }
  // console.log('in blendAlbumLists, setAlbumData saving blended album list: ', spotifyCount, blendedList);
  console.log('sorting data');
  const sortedData = sortGridData(blendedList, contextSortType);
  console.log('saving data');
  setAlbumData({
    spotifyCount,
    data: sortedData,
  });
  console.log('blend finished');
};
