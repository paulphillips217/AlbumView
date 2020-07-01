export const ACCESS_TOKEN = 'ACCESS_TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const TOKEN_EXPIRATION = 'TOKEN_EXPIRATION';
export const CONTEXT_TYPE = 'CONTEXT_TYPE';
export const CONTEXT_ITEM = 'CONTEXT_ITEM';
export const RELATED_TO_ARTIST = 'RELATED_TO_ARTIST';
export const SAVED_ALBUM_DATA = 'SAVED_ALBUM_DATA';
export const SAVED_ALBUM_OFFSET = 'SAVED_ALBUM_OFFSET';
export const SAVED_ALBUM_MORE = 'SAVED_ALBUM_MORE';
export const CONTEXT_GRID_DATA = 'CONTEXT_GRID_DATA';
export const CONTEXT_GRID_OFFSET = 'CONTEXT_GRID_OFFSET';
export const CONTEXT_GRID_MORE = 'CONTEXT_GRID_MORE';
export const CONTEXT_LIST_DATA = 'CONTEXT_LIST_DATA';
export const CONTEXT_LIST_OFFSET = 'CONTEXT_LIST_OFFSET';
export const CONTEXT_LIST_MORE = 'CONTEXT_LIST_MORE';
export const SPOTIFY_PAGE_LIMIT = 50;
export const ALBUM_VIEW_THEME = 'ALBUM_VIEW_THEME';
export const CONTEXT_GRID_COLUMNS = 'CONTEXT_GRID_COLUMNS';
export const DATA_LOADING = 'DATA_LOADING';
export const ALBUM_SORT = 'ALBUM_SORT';
export const PLAYLIST_SORT = 'PLAYLIST_SORT';
export const PLAYLIST_TRACK_SORT = 'PLAYLIST_TRACK_SORT';
export const SAVED_TRACK_SORT = 'SAVED_TRACK_SORT';

export const ContextType = {
  Playlists: 'playlists',
  Albums: 'albums',
  Artists: 'artists',
  Tracks: 'tracks',
  RelatedArtists: 'related-artists',
  LocalFiles: 'local-files',
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
