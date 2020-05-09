import {
  AUTHENTICATED,
  SELECTED_PLAYLIST,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
} from "./types";

const initialState = {
  authenticated: false,
  selectedPlaylist: "",
  accessToken: "",
  refreshToken: "",
};

export function albumViewReducer(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATED:
      console.log("setting authenticated");
      return Object.assign({}, state, {
        authenticated: true,
      });
    case ACCESS_TOKEN:
      console.log("setting access token");
      return Object.assign({}, state, {
        accessToken: action.payload,
      });
    case REFRESH_TOKEN:
      console.log("setting refresh token");
      return Object.assign({}, state, {
        refreshToken: action.payload,
      });
    case SELECTED_PLAYLIST:
      console.log("setting selected playlist");
      return Object.assign({}, state, {
        selectedPlaylist: action.payload,
      });
    default:
      return state;
  }
}
