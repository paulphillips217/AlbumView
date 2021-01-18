import {
  ContextType,
  AlbumViewTheme,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  RELATED_TO_ARTIST,
  CONTEXT_GRID_DATA,
  CONTEXT_LIST_DATA,
  ALBUM_VIEW_THEME,
  CONTEXT_GRID_COLUMNS,
  DATA_LOADING,
  SortTypes,
  ALBUM_SORT,
  PLAYLIST_TRACK_SORT,
  SAVED_TRACK_SORT,
  PLAYLIST_SORT,
  SAVED_ALBUM_DATA,
  ONE_DRIVE_LOGGED_IN,
  LOCAL_FILE_DATA,
  ONE_DRIVE_ROOT,
  SPOTIFY_IS_AUTHENTICATED,
  SELECTED_GENRE,
  SELECTED_ALBUM_ID,
  SELECTED_SPOTIFY_ALBUM_ID,
  ALBUM_JOB_ID,
} from './types';

const initialState = {
  spotifyIsAuthenticated: false,
  contextType: localStorage.getItem('contextType') || ContextType.Albums,
  contextItem: '',
  relatedToArtist: '',
  savedAlbumData: { spotifyCount: -1, data: [] },
  contextGridData: { spotifyCount: 0, data: [] },
  contextListData: {
    spotifyCount: -1,
    artistTotal: -1,
    albumTotal: -1,
    trackTotal: -1,
    offset: 0,
    data: [],
  },
  albumViewTheme: localStorage.getItem('albumViewTheme') || AlbumViewTheme.Light,
  contextGridColumns: localStorage.getItem('contextGridColumns') || 6,
  dataLoading: true,
  albumSort: localStorage.getItem('albumSort') || SortTypes.ArtistThenAlbumName,
  playlistSort: localStorage.getItem('playlistSort') || SortTypes.PlaylistName,
  playlistTrackSort: localStorage.getItem('playlistTrackSort') || SortTypes.PlaylistOrder,
  savedTrackSort: localStorage.getItem('savedTrackSort') || SortTypes.ArtistThenTrackName,
  oneDriveLoggedIn: false,
  localFileData: [],
  oneDriveRoot: '',
  selectedGenre: 0,
  selectedAlbumId: 0,
  selectedSpotifyAlbumId: '',
  albumJobId: 0,
};

export function albumViewReducer(state = initialState, action) {
  switch (action.type) {
    case SPOTIFY_IS_AUTHENTICATED:
      console.log('setting spotify is authenticated', action.payload);
      return Object.assign({}, state, {
        spotifyIsAuthenticated: action.payload,
      });
    case CONTEXT_TYPE:
      console.log('setting context type', action.payload);
      localStorage.setItem('contextType', action.payload);
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
    case CONTEXT_GRID_DATA:
      console.log('setting context grid data', action.payload);
      return Object.assign({}, state, {
        contextGridData: action.payload,
      });
    case CONTEXT_LIST_DATA:
      console.log('setting context list data', action.payload);
      return Object.assign({}, state, {
        contextListData: action.payload,
      });
    case ALBUM_VIEW_THEME:
      console.log('setting album view theme', action.payload);
      localStorage.setItem('albumViewTheme', action.payload);
      return Object.assign({}, state, {
        albumViewTheme: action.payload,
      });
    case CONTEXT_GRID_COLUMNS:
      console.log('setting context grid columns', +action.payload);
      localStorage.setItem('contextGridColumns', +action.payload);
      return Object.assign({}, state, {
        contextGridColumns: +action.payload,
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
    case ONE_DRIVE_LOGGED_IN:
      console.log('setting oneDrive logged in', action.payload);
      return Object.assign({}, state, {
        oneDriveLoggedIn: action.payload,
      });
    case LOCAL_FILE_DATA:
      console.log('setting localFileData', action.payload);
      return Object.assign({}, state, {
        localFileData: action.payload,
      });
    case ONE_DRIVE_ROOT:
      console.log('setting oneDriveRoot', action.payload);
      return Object.assign({}, state, {
        oneDriveRoot: action.payload,
      });
    case SELECTED_GENRE:
      console.log('setting selectedGenre', action.payload);
      return Object.assign({}, state, {
        selectedGenre: action.payload,
      });
    case SELECTED_ALBUM_ID:
      console.log('setting selectedAlbumId', action.payload);
      return Object.assign({}, state, {
        selectedAlbumId: action.payload,
      });
    case SELECTED_SPOTIFY_ALBUM_ID:
      console.log('setting selectedSpotifyAlbumId', action.payload);
      return Object.assign({}, state, {
        selectedSpotifyAlbumId: action.payload,
      });
    case ALBUM_JOB_ID:
      console.log('setting albumJobId', action.payload);
      return Object.assign({}, state, {
        albumJobId: action.payload,
      });
    default:
      return state;
  }
}
