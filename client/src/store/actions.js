import { ACCESS_TOKEN, REFRESH_TOKEN, SELECTED_PLAYLIST } from './types';

export const setSelectedPlaylist = (playlistId) => ({
  type: SELECTED_PLAYLIST,
  payload: playlistId,
});

export const setAccessToken = (accessToken) => ({
  type: ACCESS_TOKEN,
  payload: accessToken,
});

export const setRefreshToken = (refreshToken) => ({
  type: REFRESH_TOKEN,
  payload: refreshToken,
});
