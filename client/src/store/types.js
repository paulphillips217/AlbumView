export const SPOTIFY_ACCESS_TOKEN = 'SPOTIFY_ACCESS_TOKEN';
export const SPOTIFY_REFRESH_TOKEN = 'SPOTIFY_REFRESH_TOKEN';
export const SPOTIFY_TOKEN_EXPIRATION = 'SPOTIFY_TOKEN_EXPIRATION';
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
