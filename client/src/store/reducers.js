import moment from 'moment';
import {
  ContextType,
  GridDataType,
  AlbumViewTheme,
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
  CONTEXT_LIST_MORE,
  ALBUM_VIEW_THEME,
} from './types';

const initialState = {
  authenticated:
    localStorage.getItem('accessToken') &&
    localStorage.getItem('accessToken').length > 0 &&
    localStorage.getItem('accessToken') !== 'undefined',
  accessToken: localStorage.getItem('accessToken') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  tokenExpiration: moment(localStorage.getItem('tokenExpiration')).isValid()
    ? moment(localStorage.getItem('tokenExpiration')).format()
    : moment().format(),
  contextType: ContextType.Albums,
  contextItem: '',
  relatedToArtist: '',
  contextGridData: [],
  contextGridType: GridDataType.Album,
  contextGridOffset: 0,
  contextGridMore: false,
  contextListData: [],
  contextListOffset: 0,
  contextListMore: false,
  albumViewTheme:
    localStorage.getItem('albumViewTheme') || AlbumViewTheme.Light,
};

export function albumViewReducer(state = initialState, action) {
  switch (action.type) {
    case ACCESS_TOKEN:
      console.log('setting access token', action.payload);
      localStorage.setItem('accessToken', action.payload);
      return Object.assign({}, state, {
        accessToken: action.payload,
        authenticated: !!action.payload,
      });
    case REFRESH_TOKEN:
      console.log('setting refresh token', action.payload);
      localStorage.setItem('refreshToken', action.payload);
      return Object.assign({}, state, {
        refreshToken: action.payload,
      });
    case TOKEN_EXPIRATION:
      console.log('setting token expiration', action.payload);
      localStorage.setItem('tokenExpiration', action.payload);
      return Object.assign({}, state, {
        tokenExpiration: action.payload,
      });
    case CONTEXT_TYPE:
      console.log('setting context type', action.payload);
      return Object.assign({}, state, {
        contextType: action.payload,
      });
    case CONTEXT_ITEM:
      console.log('setting context item', action.payload);
      return Object.assign({}, state, {
        contextItem: action.payload,
      });
    case RELATED_TO_ARTIST:
      console.log('setting related to artist', action.payload);
      return Object.assign({}, state, {
        relatedToArtist: action.payload,
      });
    case CONTEXT_GRID_DATA:
      console.log('setting context grid data', action.payload);
      return Object.assign({}, state, {
        contextGridData: action.payload,
      });
    case CONTEXT_GRID_TYPE:
      console.log('setting context grid type', action.payload);
      return Object.assign({}, state, {
        contextGridType: action.payload,
      });
    case CONTEXT_GRID_OFFSET:
      console.log('setting context grid offset', action.payload);
      return Object.assign({}, state, {
        contextGridOffset: action.payload,
      });
    case CONTEXT_GRID_MORE:
      console.log('setting context grid more', action.payload);
      return Object.assign({}, state, {
        contextGridMore: action.payload,
      });
    case CONTEXT_LIST_DATA:
      console.log('setting context list data', action.payload);
      return Object.assign({}, state, {
        contextListData: action.payload,
      });
    case CONTEXT_LIST_OFFSET:
      console.log('setting context list offset', action.payload);
      return Object.assign({}, state, {
        contextListOffset: action.payload,
      });
    case CONTEXT_LIST_MORE:
      console.log('setting context list more', action.payload);
      return Object.assign({}, state, {
        contextListMore: action.payload,
      });
    case ALBUM_VIEW_THEME:
      console.log('setting album view theme', action.payload);
      localStorage.setItem('albumViewTheme', action.payload);
      return Object.assign({}, state, {
        albumViewTheme: action.payload,
      });
    default:
      return state;
  }
}
