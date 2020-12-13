import {
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  RELATED_TO_ARTIST,
  CONTEXT_GRID_DATA,
  CONTEXT_LIST_DATA,
  ALBUM_VIEW_THEME,
  CONTEXT_GRID_COLUMNS,
  DATA_LOADING,
  ALBUM_SORT,
  PLAYLIST_SORT,
  PLAYLIST_TRACK_SORT,
  SAVED_TRACK_SORT,
  SAVED_ALBUM_DATA,
  ONE_DRIVE_LOGGED_IN,
  LOCAL_FILE_DATA,
  ONE_DRIVE_ROOT,
  SPOTIFY_IS_AUTHENTICATED,
  SELECTED_GENRE,
  SELECTED_ALBUM_ID,
  SELECTED_SPOTIFY_ALBUM_ID,
} from './types';
import { sortGridData } from '../util/sortUtils';

export const setSpotifyIsAuthenticated = (isAuthenticated) => ({
  type: SPOTIFY_IS_AUTHENTICATED,
  payload: isAuthenticated,
});

export const setContextType = (type) => ({
  type: CONTEXT_TYPE,
  payload: type,
});

export const setContextItem = (id) => ({
  type: CONTEXT_ITEM,
  payload: id,
});

export const setRelatedToArtist = (artist) => ({
  type: RELATED_TO_ARTIST,
  payload: artist,
});

export const setSavedAlbumData = (data) => ({
  type: SAVED_ALBUM_DATA,
  payload: data,
});

export const setContextGridData = (data) => ({
  type: CONTEXT_GRID_DATA,
  payload: data,
});

export const setContextListData = (data) => ({
  type: CONTEXT_LIST_DATA,
  payload: data,
});

export const resetContextListData = () => ({
  type: CONTEXT_LIST_DATA,
  payload: {
    spotifyCount: -1,
    artistTotal: -1,
    albumTotal: -1,
    trackTotal: -1,
    offset: 0,
    data: [],
  },
});

export const setAlbumViewTheme = (theme) => ({
  type: ALBUM_VIEW_THEME,
  payload: theme,
});

export const setContextGridColumns = (columns) => ({
  type: CONTEXT_GRID_COLUMNS,
  payload: columns,
});

export const setDataLoading = (isLoading) => ({
  type: DATA_LOADING,
  payload: isLoading,
});

export const setAlbumSort = (sortOrder) => ({
  type: ALBUM_SORT,
  payload: sortOrder,
});

export const setPlaylistSort = (sortOrder) => ({
  type: PLAYLIST_SORT,
  payload: sortOrder,
});

export const setPlaylistTrackSort = (sortOrder) => ({
  type: PLAYLIST_TRACK_SORT,
  payload: sortOrder,
});

export const setSavedTrackSort = (sortOrder) => ({
  type: SAVED_TRACK_SORT,
  payload: sortOrder,
});

export const setOneDriveLoggedIn = (isLoggedIn) => ({
  type: ONE_DRIVE_LOGGED_IN,
  payload: isLoggedIn,
});

export const setLocalFileData = (data) => ({
  type: LOCAL_FILE_DATA,
  payload: data,
});

export const setOneDriveRoot = (root) => ({
  type: ONE_DRIVE_ROOT,
  payload: root,
});

export const setSelectedGenre = (id) => ({
  type: SELECTED_GENRE,
  payload: id,
});

export const setSelectedAlbumId = (id) => ({
  type: SELECTED_ALBUM_ID,
  payload: id,
});

export const setSelectedSpotifyAlbumId = (id) => ({
  type: SELECTED_SPOTIFY_ALBUM_ID,
  payload: id,
});

export const addSavedAlbum = (album, savedAlbumData, contextSortType, dispatch) => {
  console.log('addSavedAlbum action: ', album);
  const newData = savedAlbumData.data.concat(album);
  dispatch(
    setSavedAlbumData({
      spotifyCount: savedAlbumData.spotifyCount + 1,
      data: sortGridData(newData, contextSortType),
    })
  );
};

export const removeSavedAlbum = (spotifyAlbumId, savedAlbumData, dispatch) => {
  if (savedAlbumData.data.some((item) => item.spotifyAlbumId === spotifyAlbumId)) {
    const newData = savedAlbumData.data.filter(
      (item) => item.spotifyAlbumId !== spotifyAlbumId
    );
    // for simplification we assume it's only one we're removing
    dispatch(
      setSavedAlbumData({
        spotifyCount: savedAlbumData.spotifyCount - 1,
        data: newData,
      })
    );
  }
};
