import {
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_REFRESH_TOKEN,
  SPOTIFY_TOKEN_EXPIRATION,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  RELATED_TO_ARTIST,
  CONTEXT_GRID_DATA,
  CONTEXT_LIST_DATA,
  ALBUM_VIEW_THEME,
  CONTEXT_GRID_COLUMNS,
  DATA_LOADING,
  ALBUM_SORT,
  PLAYLIST_SORT,
  PLAYLIST_TRACK_SORT,
  SAVED_TRACK_SORT,
  SAVED_ALBUM_DATA,
  ONE_DRIVE_LOGGED_IN,
} from './types';

export const setSpotifyAccessToken = (accessToken) => ({
  type: SPOTIFY_ACCESS_TOKEN,
  payload: accessToken,
});

export const setSpotifyRefreshToken = (refreshToken) => ({
  type: SPOTIFY_REFRESH_TOKEN,
  payload: refreshToken,
});

export const setSpotifyTokenExpiration = (tokenExpiration) => ({
  type: SPOTIFY_TOKEN_EXPIRATION,
  payload: tokenExpiration,
});

export const setContextType = (type) => ({
  type: CONTEXT_TYPE,
  payload: type,
});

export const setContextItem = (id) => ({
  type: CONTEXT_ITEM,
  payload: id,
});

export const setRelatedToArtist = (artist) => ({
  type: RELATED_TO_ARTIST,
  payload: artist,
});

export const setSavedAlbumData = (data) => ({
  type: SAVED_ALBUM_DATA,
  payload: data,
});

export const setContextGridData = (data) => ({
  type: CONTEXT_GRID_DATA,
  payload: data,
});

export const setContextListData = (data) => ({
  type: CONTEXT_LIST_DATA,
  payload: data,
});

export const resetContextListData = () => ({
  type: CONTEXT_LIST_DATA,
  payload: {
    totalCount: -1,
    artistTotal: -1,
    albumTotal: -1,
    trackTotal: -1,
    offset: 0,
    data: [],
  },
});

export const setAlbumViewTheme = (theme) => ({
  type: ALBUM_VIEW_THEME,
  payload: theme,
});

export const setContextGridColumns = (columns) => ({
  type: CONTEXT_GRID_COLUMNS,
  payload: columns,
});

export const setDataLoading = (isLoading) => ({
  type: DATA_LOADING,
  payload: isLoading,
});

export const setAlbumSort = (sortOrder) => ({
  type: ALBUM_SORT,
  payload: sortOrder,
});

export const setPlaylistSort = (sortOrder) => ({
  type: PLAYLIST_SORT,
  payload: sortOrder,
});

export const setPlaylistTrackSort = (sortOrder) => ({
  type: PLAYLIST_TRACK_SORT,
  payload: sortOrder,
});

export const setSavedTrackSort = (sortOrder) => ({
  type: SAVED_TRACK_SORT,
  payload: sortOrder,
});

export const setOneDriveLoggedIn = (isLoggedIn) => ({
  type: ONE_DRIVE_LOGGED_IN,
  payload: isLoggedIn,
});
