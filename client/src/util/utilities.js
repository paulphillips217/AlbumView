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

export const stripLeadingArticle = (string) => {
  return string.replace(/^(an?|the)\s/i, '');
};

export const sortByArtistThenAlbum = (a, b) => {
  const artist1 = stripLeadingArticle(a.artist).toLowerCase();
  const artist2 = stripLeadingArticle(b.artist).toLowerCase();
  // if the artists are the same, sort by the album names
  if (artist1 === artist2) {
    const albumName1 = stripLeadingArticle(a.albumName).toLowerCase();
    const albumName2 = stripLeadingArticle(b.albumName).toLowerCase();
    if (albumName1 === albumName2) {
      return 0;
    }
    return albumName1 > albumName2;
  }
  return artist1 > artist2;
};

export const sortByArtist = (a, b) => {
  const artist1 = stripLeadingArticle(a.name).toLowerCase();
  const artist2 = stripLeadingArticle(b.name).toLowerCase();
  if (artist1 === artist2) {
    return 0;
  }
  return artist1 > artist2;
};

export const filterByAlbumType = (album, type) => {
  if (album.albumGroup) {
    return album.albumGroup === type;
  }
  return album.albumType === type;
};
