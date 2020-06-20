import { ContextType } from './types';

export const getAuthenticationState = (store) => store.albumView.authenticated;
export const getAccessToken = (store) =>
  store.albumView.accessToken || localStorage.getItem('accessToken') || '';
export const getRefreshToken = (store) =>
  store.albumView.refreshToken || localStorage.getItem('refreshToken') || '';
export const getTokenExpiration = (store) =>
  store.albumView.tokenExpiration ||
  localStorage.getItem('tokenExpiration') ||
  '';
export const getContextType = (store) => store.albumView.contextType;
export const getContextItem = (store) => store.albumView.contextItem;
export const getRelatedToArtist = (store) => store.albumView.relatedToArtist;
export const getContextGridData = (store) => store.albumView.contextGridData;
export const getContextGridType = (store) => store.albumView.contextGridType;
export const getContextGridOffset = (store) =>
  store.albumView.contextGridOffset;
export const getContextGridMore = (store) => store.albumView.contextGridMore;
export const getContextListData = (store) => store.albumView.contextListData;
export const getContextListOffset = (store) =>
  store.albumView.contextListOffset;
export const getContextListMore = (store) => store.albumView.contextListMore;
export const getAlbumViewTheme = (store) => store.albumView.albumViewTheme;
export const getContextGridColumns = (store) =>
  store.albumView.contextGridColumns;
export const getDataLoading = (store) => store.albumView.dataLoading;
export const getAlbumSort = (store) => store.albumView.albumSort;
export const getPlaylistSort = (store) => store.albumView.playlistSort;
export const getPlaylistTrackSort = (store) => store.albumView.playlistTrackSort;
export const getSavedTrackSort = (store) => store.albumView.savedTrackSort;

export const getContextSortType = (store) => {
  switch (store.albumView.contextType) {
    case ContextType.Albums:
    case ContextType.Artists:
    case ContextType.RelatedArtists:
    case ContextType.LocalFiles:
      return getAlbumSort(store);
    case ContextType.Tracks:
      return getSavedTrackSort(store);
    case ContextType.Playlists:
      return getPlaylistTrackSort(store);
    default:
      console.error('unknown context type in getContextSortType', store.albumView.contextType);
  }
};
