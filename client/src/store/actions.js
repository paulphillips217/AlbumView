import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  CONTEXT_GRID_DATA,
  CONTEXT_GRID_TYPE,
  CONTEXT_GRID_OFFSET,
  CONTEXT_LIST_DATA,
  CONTEXT_LIST_OFFSET,
} from './types';

export const setAccessToken = (accessToken) => ({
  type: ACCESS_TOKEN,
  payload: accessToken,
});

export const setRefreshToken = (refreshToken) => ({
  type: REFRESH_TOKEN,
  payload: refreshToken,
});

export const setContextType = (type) => ({
  type: CONTEXT_TYPE,
  payload: type,
});

export const setContextItem = (id) => ({
  type: CONTEXT_ITEM,
  payload: id,
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

export const setContextListData = (data) => ({
  type: CONTEXT_LIST_DATA,
  payload: data,
});

export const setContextListOffset = (offset) => ({
  type: CONTEXT_LIST_OFFSET,
  payload: offset,
});
