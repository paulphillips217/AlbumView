const db = require('./db.js');

const insertSingleAlbum = (album) => {
  if (album.spotifyId) {
    return db('album')
      .select()
      .where('spotifyId', album.spotifyId)
      .then((rows) => returnOrInsertAlbum(rows, album))
      .catch((err) => {
        console.log('insertSingleAlbum error: ', err);
        return null;
      });
  } else {
    return db('album')
      .select()
      .where('name', album.name)
      .then((rows) => returnOrInsertAlbum(rows, album))
      .catch((err) => {
        console.log('insertSingleAlbum error: ', err);
        return null;
      });
  }
};

const returnOrInsertAlbum = (rows, album) => {
  if (rows && rows.length > 0) {
    // duplicate spotifyId found
    // console.log('insertSingleAlbum duplicate found: ', rows);
    return rows[0].id;
  } else {
    // no matching records found
    return db('album')
      .returning('id')
      .insert(album)
      .then((rows) => {
        if (rows.length > 0) {
          // console.log('insertSingleAlbum inserted: ', rows);
          return rows[0];
        } else {
          console.log('insertSingleAlbum added row but got no results');
          return null;
        }
      });
  }
};

const getAlbumsWithNoMbid = () => {
  console.log('getAlbumsWithNoMbid');
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .whereNull('album.musicBrainzId')
    .select(
      { albumId: 'album.id' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' }
    )
    .catch((err) => console.log('getAlbumsWithNoMbid error', err));
};

const getAlbumsWithNoTadbId = () => {
  console.log('getAlbumsWithNoTadbId');
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .whereNull('album.tadbId')
    .select(
      { albumId: 'album.id' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' }
    )
    .catch((err) => console.log('getAlbumsWithNoTadbId error', err));
};

const addMusicBrainzId = (albumId, musicBrainzId) => {
  console.log('addMusicBrainzId ', albumId, musicBrainzId);
  db('album')
    .where({ id: albumId })
    .update('musicBrainzId', musicBrainzId)
    .catch((err) => console.log('addMusicBrainzId error', err));
};

const addTadbId = (albumId, tadbId) => {
  console.log('addTadbId ', albumId, tadbId);
  db('album')
    .where({ id: albumId })
    .update('tadbId', tadbId)
    .catch((err) => console.log('addTadbId error', err));
};

const getAlbumsWithNoGenres = () => {
  console.log('getAlbumsWithNoGenres');
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .leftOuterJoin('albumGenres', 'album.id', 'albumGenres.albumId')
    .whereNull('albumGenres.genreId')
    .select(
      { albumId: 'album.id' },
      { musicBrainzId: 'album.musicBrainzId' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' }
    )
    .catch((err) => console.log('getAlbumsWithNoGenres error', err));
};

const addAlbumGenre = (albumId, genreId) => {
  return db('albumGenres')
    .select()
    .where({
      albumId: albumId,
      genreId: genreId,
    })
    .then((rows) => {
      if (rows.length === 0) {
        // no matching records found
        return db('albumGenres')
          .insert({
            albumId: albumId,
            genreId: genreId,
          })
          .returning(['albumId', 'genreId'])
          .then((rows) => {
            if (rows.length > 0) {
              return rows[0];
            } else {
              console.log('addAlbumGenre added row but got no results');
              return null;
            }
          });
      } else {
        // duplicate albumGenres found
        console.log('addAlbumGenre duplicate found: ', albumId, genreId);
        return rows[0];
      }
    })
    .catch((err) => {
      console.log(
        'addAlbumGenre error (albumId, genreId): ',
        err,
        albumId,
        genreId
      );
      return null;
    });
};

const getAlbumGenres = () => {
  return db('albumGenres')
    .select()
    .catch((err) => {
      console.log('getAlbumGenres error: ', err);
      return null;
    });
};

module.exports = {
  insertSingleAlbum,
  getAlbumsWithNoMbid,
  getAlbumsWithNoTadbId,
  addMusicBrainzId,
  addTadbId,
  getAlbumsWithNoGenres,
  addAlbumGenre,
  getAlbumGenres,
};
