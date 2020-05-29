export const getAuthenticationState = (store) => store.albumView.authenticated;
export const getAccessToken = (store) =>
  store.albumView.accessToken || localStorage.getItem('accessToken') || '';
export const getRefreshToken = (store) =>
  store.albumView.refreshToken || localStorage.getItem('refreshToken') || '';
export const getContextType = (store) => store.albumView.contextType;
export const getContextItem = (store) => store.albumView.contextItem;
export const getContextGridData = (store) => store.albumView.contextGridData;
export const getContextGridType = (store) => store.albumView.contextGridType;
export const getContextGridOffset = (store) => store.albumView.contextGridOffset;
export const getContextListData = (store) => store.albumView.contextListData;
export const getContextListOffset = (store) => store.albumView.contextListOffset;
