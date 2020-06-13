import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  TOKEN_EXPIRATION,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  RELATED_TO_ARTIST,
  CONTEXT_GRID_DATA,
  CONTEXT_GRID_TYPE,
  CONTEXT_GRID_OFFSET,
  CONTEXT_LIST_DATA,
  CONTEXT_LIST_OFFSET,
  CONTEXT_GRID_MORE,
  CONTEXT_LIST_MORE, ALBUM_VIEW_THEME, SHOW_CONFIG, CONTEXT_GRID_COLUMNS
} from './types';

export const setAccessToken = (accessToken) => ({
  type: ACCESS_TOKEN,
  payload: accessToken,
});

export const setRefreshToken = (refreshToken) => ({
  type: REFRESH_TOKEN,
  payload: refreshToken,
});

export const setTokenExpiration = (tokenExpiration) => ({
  type: TOKEN_EXPIRATION,
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

export const setContextGridData = (data) => ({
  type: CONTEXT_GRID_DATA,
  payload: data,
});

export const setContextGridType = (type) => ({
  type: CONTEXT_GRID_TYPE,
  payload: type,
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
