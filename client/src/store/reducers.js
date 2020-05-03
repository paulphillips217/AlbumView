import { AUTHENTICATED, SELECTED_PLAYLIST } from "./types";

const initialState = {
  authenticated: false,
  selectedPlaylist: "",
};

export function authenticationReducer(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATED:
      console.log("setting authenticated");
      return Object.assign({}, state, {
        authenticated: true,
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
