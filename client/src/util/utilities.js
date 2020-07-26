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

export const trimTrackFileName = (name) => {
  let newName = name;
  // if the first two characters are numeric, remove them
  let num = newName.slice(0, 2);
  if (+num === +num) {
    newName = newName.slice(2, newName.length);
  } else {
    // if the first one character is numeric, remove it
    num = newName.slice(0, 1);
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
