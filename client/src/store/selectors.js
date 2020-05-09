export const getAuthenticationState = (store) => store.albumView.authenticated;
export const getSelectedPlaylist = (store) => store.albumView.selectedPlaylist;
export const getAccessToken = (store) =>
  store.albumView.accessToken || localStorage.getItem('accessToken') || '';
export const getRefreshToken = (store) =>
  store.albumView.refreshToken || localStorage.getItem('refreshToken') || '';
