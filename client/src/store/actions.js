import {
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_REFRESH_TOKEN,
  SPOTIFY_TOKEN_EXPIRATION,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  RELATED_TO_ARTIST,
  CONTEXT_GRID_DATA,
  CONTEXT_GRID_OFFSET,
  CONTEXT_LIST_DATA,
  CONTEXT_LIST_OFFSET,
  CONTEXT_GRID_MORE,
  CONTEXT_LIST_MORE,
  ALBUM_VIEW_THEME,
  CONTEXT_GRID_COLUMNS,
  DATA_LOADING,
  ALBUM_SORT,
  PLAYLIST_SORT,
  PLAYLIST_TRACK_SORT,
  SAVED_TRACK_SORT,
  SAVED_ALBUM_DATA,
  SAVED_ALBUM_OFFSET,
  SAVED_ALBUM_MORE,
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

export const setSavedAlbumOffset = (offset) => ({
  type: SAVED_ALBUM_OFFSET,
  payload: offset,
});

export const setSavedAlbumMore = (more) => ({
  type: SAVED_ALBUM_MORE,
  payload: more,
});

export const setContextGridData = (data) => ({
  type: CONTEXT_GRID_DATA,
  payload: data,
});

export const setContextGridOffset = (offset) => ({
  type: CONTEXT_GRID_OFFSET,
  payload: offset,
});

export const setContextGridMore = (more) => ({
  type: CONTEXT_GRID_MORE,
  payload: more,
});

export const setContextListData = (data) => ({
  type: CONTEXT_LIST_DATA,
  payload: data,
});

export const setContextListOffset = (offset) => ({
  type: CONTEXT_LIST_OFFSET,
  payload: offset,
});

export const setContextListMore = (more) => ({
  type: CONTEXT_LIST_MORE,
  payload: more,
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
