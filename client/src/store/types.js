export const SPOTIFY_IS_AUTHENTICATED = 'SPOTIFY_IS_AUTHENTICATED';
export const CONTEXT_TYPE = 'CONTEXT_TYPE';
export const CONTEXT_ITEM = 'CONTEXT_ITEM';
export const RELATED_TO_ARTIST = 'RELATED_TO_ARTIST';
export const SAVED_ALBUM_DATA = 'SAVED_ALBUM_DATA';
export const CONTEXT_GRID_DATA = 'CONTEXT_GRID_DATA';
export const CONTEXT_LIST_DATA = 'CONTEXT_LIST_DATA';
export const SPOTIFY_PAGE_LIMIT = 50;
export const ALBUM_VIEW_THEME = 'ALBUM_VIEW_THEME';
export const CONTEXT_GRID_COLUMNS = 'CONTEXT_GRID_COLUMNS';
export const DATA_LOADING = 'DATA_LOADING';
export const ALBUM_SORT = 'ALBUM_SORT';
export const PLAYLIST_SORT = 'PLAYLIST_SORT';
export const PLAYLIST_TRACK_SORT = 'PLAYLIST_TRACK_SORT';
export const SAVED_TRACK_SORT = 'SAVED_TRACK_SORT';
export const ONE_DRIVE_LOGGED_IN = 'ONE_DRIVE_LOGGED_IN';
export const LOCAL_FILE_DATA = 'LOCAL_FILE_DATA';
export const ONE_DRIVE_ROOT = 'ONE_DRIVE_ROOT';
export const SELECTED_GENRE = 'SELECTED_GENRE';
export const SELECTED_ALBUM_ID = 'SELECTED_ALBUM_ID';
export const SELECTED_SPOTIFY_ALBUM_ID = 'SELECTED_SPOTIFY_ALBUM_ID';
export const ALBUM_JOB_ID = 'ALBUM_JOB_ID';

export const ContextType = {
  Playlists: 'playlists',
  Albums: 'albums',
  Artists: 'artists',
  Tracks: 'tracks',
  RelatedArtists: 'related-artists',
  LocalFiles: 'local-files',
  OneDriveFiles: 'one-drive-files',
};

export const AlbumViewTheme = {
  Light: 'light',
  Dark: 'dark',
};

export const SortTypes = {
  ArtistThenAlbumName: 'ArtistThenAlbumName',
  ArtistThenAlbumDate: 'ArtistThenAlbumDate',
  ArtistThenTrackName: 'ArtistThenTrackName',
  TrackName: 'TrackName',
  PlaylistName: 'PlaylistName',
  PlaylistAuthor: 'PlaylistAuthor',
  PlaylistOrder: 'PlaylistOrder',
};

export const ModalDisplayTypes = {
  Spotify: 'spotify',
  Local: 'local',
  OneDrive: 'oneDrive',
  Unknown: 'unknown',
};
