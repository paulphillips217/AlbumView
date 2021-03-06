import { SortTypes } from '../store/types';

export const sortGridData = (data, sortType) => {
  switch (sortType) {
    case SortTypes.ArtistThenAlbumName:
      return data.sort(sortByArtistThenAlbumName);
    case SortTypes.ArtistThenAlbumDate:
      return data.sort(sortByArtistThenAlbumDate);
    case SortTypes.ArtistThenTrackName:
      return data.sort(sortByArtistThenTrackName);
    case SortTypes.TrackName:
      return data.sort(sortByTrackName);
    case SortTypes.PlaylistName:
      return data.sort(sortByName);
    case SortTypes.PlaylistAuthor:
      return data.sort(sortByAuthor);
    case SortTypes.PlaylistOrder:
      return data; // original order, no sort
    default:
      console.error('unknown sort type in sortGridData', sortType);
  }
};

export const stripLeadingArticle = (string) => {
  if (typeof string === 'string' || string instanceof String) {
    return string ? string.replace(/^(an?|the)\s/i, '') : '';
  } else {
    console.log('stripLeadingArticle -- string is not a string', string);
    return 'xxxxxxxxxx';
  }
};

export const sortByArtistThenAlbumName = (a, b) => {
  const artist1 = stripLeadingArticle(a.artistName).toLowerCase();
  const artist2 = stripLeadingArticle(b.artistName).toLowerCase();
  // if the artists are the same, sort by the album names
  if (artist1 === artist2) {
    const albumName1 = stripLeadingArticle(a.albumName).toLowerCase();
    const albumName2 = stripLeadingArticle(b.albumName).toLowerCase();
    if (albumName1 === albumName2) {
      const trackName1 = stripLeadingArticle(a.trackName).toLowerCase();
      const trackName2 = stripLeadingArticle(b.trackName).toLowerCase();
      if (trackName1 === trackName2) {
        return 0;
      }
      return trackName1 > trackName2;
    }
    return albumName1 > albumName2;
  }
  return artist1 > artist2;
};

export const sortByArtistThenAlbumDate = (a, b) => {
  const artist1 = stripLeadingArticle(a.artistName).toLowerCase();
  const artist2 = stripLeadingArticle(b.artistName).toLowerCase();
  // if the artists are the same, sort by the album date
  if (artist1 === artist2) {
    const albumDate1 = a.releaseDate ? a.releaseDate : Date.now();
    const albumDate2 = b.releaseDate ? b.releaseDate : Date.now();
    if (albumDate1 === albumDate2) {
      if (!a.trackName || !b.trackName) {
        return 0;
      }
      const trackName1 = stripLeadingArticle(a.trackName).toLowerCase();
      const trackName2 = stripLeadingArticle(b.trackName).toLowerCase();
      if (trackName1 === trackName2) {
        return 0;
      }
      return trackName1 > trackName2;
    }
    return albumDate1 > albumDate2;
  }
  return artist1 > artist2;
};

export const sortByArtistThenTrackName = (a, b) => {
  const artist1 = stripLeadingArticle(a.artistName).toLowerCase();
  const artist2 = stripLeadingArticle(b.artistName).toLowerCase();
  // if the artists are the same, sort by the album date
  if (artist1 === artist2) {
    const trackName1 = stripLeadingArticle(a.trackName).toLowerCase();
    const trackName2 = stripLeadingArticle(b.trackName).toLowerCase();
    if (trackName1 === trackName2) {
      return 0;
    }
    return trackName1 > trackName2;
  }
  return artist1 > artist2;
};

export const sortByTrackName = (a, b) => {
  const artist1 = stripLeadingArticle(a.trackName).toLowerCase();
  const artist2 = stripLeadingArticle(b.trackName).toLowerCase();
  if (artist1 === artist2) {
    return 0;
  }
  return artist1 > artist2;
};

export const sortByName = (a, b) => {
  const artist1 = stripLeadingArticle(a.name).toLowerCase();
  const artist2 = stripLeadingArticle(b.name).toLowerCase();
  if (artist1 === artist2) {
    return 0;
  }
  return artist1 > artist2;
};

export const sortByAuthor = (a, b) => {
  const artist1 = stripLeadingArticle(a.author).toLowerCase();
  const artist2 = stripLeadingArticle(b.author).toLowerCase();
  if (artist1 === artist2) {
    return 0;
  }
  return artist1 > artist2;
};
