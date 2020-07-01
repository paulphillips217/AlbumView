import moment from 'moment';
import {
  ContextType,
  AlbumViewTheme,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  TOKEN_EXPIRATION,
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
  SortTypes,
  ALBUM_SORT,
  PLAYLIST_TRACK_SORT,
  SAVED_TRACK_SORT,
  PLAYLIST_SORT,
  SAVED_ALBUM_DATA,
  SAVED_ALBUM_OFFSET,
  SAVED_ALBUM_MORE,
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
  savedAlbumData: [],
  savedAlbumOffset: 0,
  savedAlbumMore: false,
  contextGridData: [],
  contextGridOffset: 0,
  contextGridMore: false,
  contextListData: [],
  contextListOffset: 0,
  contextListMore: false,
  albumViewTheme:
    localStorage.getItem('albumViewTheme') || AlbumViewTheme.Light,
  contextGridColumns: localStorage.getItem('contextGridColumns') || 6,
  dataLoading: true,
  albumSort: localStorage.getItem('albumSort') || SortTypes.ArtistThenAlbumName,
  playlistSort: localStorage.getItem('playlistSort') || SortTypes.PlaylistName,
  playlistTrackSort:
    localStorage.getItem('playlistTrackSort') || SortTypes.PlaylistOrder,
  savedTrackSort:
    localStorage.getItem('savedTrackSort') || SortTypes.ArtistThenTrackName,
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
    case SAVED_ALBUM_DATA:
      console.log('setting saved album data', action.payload);
      return Object.assign({}, state, {
        savedAlbumData: action.payload,
      });
    case SAVED_ALBUM_OFFSET:
      console.log('setting saved album offset', action.payload);
      return Object.assign({}, state, {
        savedAlbumOffset: action.payload,
      });
    case SAVED_ALBUM_MORE:
      console.log('setting saved album more', action.payload);
      return Object.assign({}, state, {
        savedAlbumMore: action.payload,
      });
    case CONTEXT_GRID_DATA:
      console.log('setting context grid data', action.payload);
      return Object.assign({}, state, {
        contextGridData: action.payload,
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
    case CONTEXT_GRID_COLUMNS:
      console.log('setting context grid columns', action.payload);
      localStorage.setItem('contextGridColumns', action.payload);
      return Object.assign({}, state, {
        contextGridColumns: action.payload,
      });
    case DATA_LOADING:
      console.log('setting data loading', action.payload);
      return Object.assign({}, state, {
        dataLoading: action.payload,
      });
    case ALBUM_SORT:
      console.log('setting album sort', action.payload);
      localStorage.setItem('albumSort', action.payload);
      return Object.assign({}, state, {
        albumSort: action.payload,
      });
    case PLAYLIST_SORT:
      console.log('setting playlist sort', action.payload);
      localStorage.setItem('playlistSort', action.payload);
      return Object.assign({}, state, {
        playlistSort: action.payload,
      });
    case PLAYLIST_TRACK_SORT:
      console.log('setting playlist track sort', action.payload);
      localStorage.setItem('playlistTrackSort', action.payload);
      return Object.assign({}, state, {
        playlistTrackSort: action.payload,
      });
    case SAVED_TRACK_SORT:
      console.log('setting saved track sort', action.payload);
      localStorage.setItem('savedTrackSort', action.payload);
      return Object.assign({}, state, {
        savedTrackSort: action.payload,
      });
    default:
      return state;
  }
}
