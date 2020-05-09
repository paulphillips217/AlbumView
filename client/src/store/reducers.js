import { SELECTED_PLAYLIST, ACCESS_TOKEN, REFRESH_TOKEN } from './types';

const initialState = {
  authenticated: !!localStorage.getItem('accessToken'),
  selectedPlaylist: '',
  accessToken: localStorage.getItem('accessToken') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
};

export function albumViewReducer(state = initialState, action) {
  switch (action.type) {
    case ACCESS_TOKEN:
      console.log('setting access token');
      localStorage.setItem('accessToken', action.payload);
      return Object.assign({}, state, {
        accessToken: action.payload,
        authenticated: !!action.payload,
      });
    case REFRESH_TOKEN:
      console.log('setting refresh token');
      localStorage.setItem('refreshToken', action.payload);
      return Object.assign({}, state, {
        refreshToken: action.payload,
      });
    case SELECTED_PLAYLIST:
      console.log('setting selected playlist');
      return Object.assign({}, state, {
        selectedPlaylist: action.payload,
      });
    default:
      return state;
  }
}
