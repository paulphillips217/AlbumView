import { ACCESS_TOKEN, REFRESH_TOKEN, CONTEXT_TYPE, CONTEXT_ITEM } from './types';

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
