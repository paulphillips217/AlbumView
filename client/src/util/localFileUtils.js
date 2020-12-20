const trimTrackFileName = (name) => {
  let newName = name;
  // if the first two characters are numeric, remove them
  let num = newName.slice(0, 2);
  // the best way to check for NaN is by checking for self-equality
  // eslint-disable-next-line no-self-compare
  if (+num === +num) {
    newName = newName.slice(2, newName.length);
  } else {
    // if the first one character is numeric, remove it
    num = newName.slice(0, 1);
    // eslint-disable-next-line no-self-compare
    if (+num === +num) {
      newName = newName.slice(1, newName.length);
    }
  }
  // if the last 3 or 4 characters are an extension (come after a dot) remove them
  newName =
    newName.charAt(newName.length - 5) === '.'
      ? newName.slice(0, newName.length - 5)
      : newName;
  newName =
    newName.charAt(newName.length - 4) === '.'
      ? newName.slice(0, newName.length - 4)
      : newName;
  return newName;
};

export const createLocalTracks = (album) => {
  console.log('createLocalTracks', album);
  if (album?.localFileObjects) {
    return album.localFileObjects.map((track) => ({
      name: trimTrackFileName(track.name),
      url: URL.createObjectURL(track),
    }));
  }
  if (album?.tracks) {
    return album.tracks.map((track) => ({
      name: trimTrackFileName(track.name),
      url: URL.createObjectURL(track),
    }));
  }
  return [];
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

export const createLocalAlbumTracks = (fileData) => {
  const theAlbumArray = [];
  Object.keys(fileData).forEach((key, index) => {
    const item = fileData[key];
    if (!item.type.includes('audio')) {
      return;
    }
    const splitPath = item.webkitRelativePath.split('/');
    const artistName = splitPath.length >= 3 ? splitPath[splitPath.length - 3] : 'invalid';
    const albumName =
      splitPath.length >= 3 ? splitPath[splitPath.length - 2] : 'invalid';
    const fileIndex = theAlbumArray.findIndex(
      (a) => a.artistName && a.artistName === artistName && a.albumName && a.albumName === albumName
    );
    // console.log(`createLocalAlbumTracks [${fileIndex}]: ${artistName}, ${albumName}`);
    if (fileIndex >= 0) {
      theAlbumArray[fileIndex].tracks.push(item);
    } else {
      theAlbumArray.push({
        artistName,
        albumName,
        localId: index + 1,
        tracks: [item],
      });
    }
  });
  console.log('read local albums: ', theAlbumArray);
  return theAlbumArray;
};
