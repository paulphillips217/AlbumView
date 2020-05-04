import { AUTHENTICATED, SELECTED_PLAYLIST } from "./types";

export const setAuthenticated = () => ({
  type: AUTHENTICATED,
});

export const setSelectedPlaylist = (playlistId) => ({
  type: SELECTED_PLAYLIST,
  payload: playlistId,
});
