import { ContextType } from './types';

export const getSpotifyIsAuthenticated = (store) => store.albumView.spotifyIsAuthenticated;
export const getContextType = (store) => store.albumView.contextType;
export const getContextItem = (store) => store.albumView.contextItem;
export const getRelatedToArtist = (store) => store.albumView.relatedToArtist;
export const getSavedAlbumData = (store) => store.albumView.savedAlbumData;
export const getContextGridData = (store) => store.albumView.contextGridData;
export const getContextListData = (store) => store.albumView.contextListData;
export const getAlbumViewTheme = (store) => store.albumView.albumViewTheme;
export const getContextGridColumns = (store) => +store.albumView.contextGridColumns;
export const getDataLoading = (store) => store.albumView.dataLoading;
export const getAlbumSort = (store) => store.albumView.albumSort;
export const getPlaylistSort = (store) => store.albumView.playlistSort;
export const getPlaylistTrackSort = (store) => store.albumView.playlistTrackSort;
export const getSavedTrackSort = (store) => store.albumView.savedTrackSort;
export const getOneDriveLoggedIn = (store) => store.albumView.oneDriveLoggedIn;
export const getLocalFileData = (store) => store.albumView.localFileData;
export const getOneDriveRoot = (store) => store.albumView.oneDriveRoot;
export const getSelectedGenre = (store) => store.albumView.selectedGenre;
export const getSelectedAlbumId = (store) => store.albumView.selectedAlbumId;
export const getSelectedSpotifyAlbumId = (store) => store.albumView.selectedSpotifyAlbumId;

export const getContextSortType = (store) => {
  switch (store.albumView.contextType) {
    case ContextType.Albums:
    case ContextType.Artists:
    case ContextType.RelatedArtists:
    case ContextType.LocalFiles:
    case ContextType.OneDriveFiles:
      return getAlbumSort(store);
    case ContextType.Tracks:
      return getSavedTrackSort(store);
    case ContextType.Playlists:
      return getPlaylistTrackSort(store);
    default:
      console.error(
        'unknown context type in getContextSortType',
        store.albumView.contextType
      );
  }
};
