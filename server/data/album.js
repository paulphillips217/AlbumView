const db = require('./db.js');
const utilities = require('../utilities');

const insertSingleAlbum = (album) => {
  album.matchName = utilities.makeMatchName(album.name);
  return db
    .transaction((trx) => {
      if (album.spotifyId) {
        return trx('album')
          .select()
          .where('spotifyId', album.spotifyId)
          .then((rows) => {
            if (rows && rows.length > 0) {
              return returnOrInsertAlbum(trx, rows, album);
            } else {
              // if spotify id not found, it still may be in database without an id
              return trx('album')
                .select()
                .where('matchName', album.matchName)
                .then((rows) => returnOrInsertAlbum(trx, rows, album))
                .catch((err) => {
                  console.log('insertSingleAlbum select error: ', err.name, err.message, album);
                  return null;
                });
            }
          })
          .catch((err) => {
            console.log('insertSingleAlbum select error: ', err.name, err.message, album);
            return null;
          });
      } else {
        return trx('album')
          .select()
          .where({
            artistId: album.artistId,
            matchName: album.matchName,
          })
          .then((rows) => returnOrInsertAlbum(trx, rows, album))
          .catch((err) => {
            console.log('insertSingleAlbum select error: ', err.name, err.message, album);
            return null;
          });
      }
    })
    .then((result) => {
      // console.log('insertSingleAlbum transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log('insertSingleAlbum transaction error: ', err.name, err.message, album);
      return null;
    });
};

const returnOrInsertAlbum = (trx, rows, album) => {
  if (rows && rows.length > 0) {
    // duplicate spotifyId found
    // console.log('insertSingleAlbum duplicate found: ', rows);
    if (album.spotifyId && !rows[0].spotifyId) {
      // updating album record to include spotifyId
      trx('album')
        .where('id', rows[0].id)
        .update({
          spotifyId: album.spotifyId,
          name: album.name,
          imageUrl: album.imageUrl,
          releaseDate: album.releaseDate,
        })
        .then((result) => {
          console.log('insertSingleAlbum update result: ', result);
        })
        .catch((err) => {
          console.log('insertSingleAlbum update error: ', err.name, err.message, album);
        });
    }
    return rows[0].id;
  } else {
    // no matching records found
    return trx('album')
      .returning('id')
      .insert(album)
      .then((rows) => {
        if (rows && rows.length > 0) {
          // console.log('insertSingleAlbum inserted: ', rows);
          return rows[0];
        } else {
          console.log('insertSingleAlbum added row but got no results');
          return null;
        }
      })
      .catch((err) => {
        console.log('insertSingleAlbum insert error: ', err.name, err.message, album);
        return null;
      });
  }
};

const getAlbumsWithNoSpotifyId = () => {
  console.log('getAlbumsWithNoSpotifyId');
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .whereNull('album.spotifyId')
    .select(
      { albumId: 'album.id' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' }
    )
    .catch((err) => console.log('getAlbumsWithNoSpotifyId error', err.name, err.message));
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
    .catch((err) => console.log('getAlbumsWithNoMbid error', err.name, err.message));
};

const getAlbumsWithNoTadbId = () => {
  // console.log('getAlbumsWithNoTadbId');
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .whereNull('album.tadbId')
    .select(
      { albumId: 'album.id' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' }
    )
    .catch((err) => console.log('getAlbumsWithNoTadbId error', err.name, err.message));
};

const getAlbumById = (albumId) => {
  // console.log('getAlbumById');
  return db
    .from('album')
    .where({ id: albumId})
    .then((rows) => {
      if (rows && rows.length > 0) {
        // console.log('getAlbumById got: ', rows);
        return rows[0];
      } else {
        console.log('getAlbumById got no results');
        return null;
      }
    })
    .catch((err) => console.log('getAlbumById error', err.name, err.message));
};

const addMusicBrainzId = (albumId, musicBrainzId) => {
  console.log('addMusicBrainzId ', albumId, musicBrainzId);
  db('album')
    .where({ id: albumId })
    .update('musicBrainzId', musicBrainzId)
    .catch((err) => console.log('addMusicBrainzId error', err.name, err.message));
};

const addSpotifyId = (albumId, spotifyId) => {
  console.log('addSpotifyId ', albumId, spotifyId);
  db('album')
    .where({ id: albumId })
    .update('spotifyId', spotifyId)
    .catch((err) => console.log('addSpotifyId error', err.name, err.message));
};

const addTadbId = (albumId, tadbId) => {
  // console.log('addTadbId ', albumId, tadbId);
  db('album')
    .where({ id: albumId })
    .update('tadbId', tadbId)
    .catch((err) => console.log('addTadbId error', err.name, err.message));
};

const updateAlbum = (albumId, album) => {
  console.log('updateAlbum for album ', albumId);
  return db('album')
    .where({ id: albumId })
    .update(album)
    .catch((err) => console.log('updateAlbum error', err.name, err.message));
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
    .catch((err) => console.log('getAlbumsWithNoGenres error', err.name, err.message));
};

const insertAlbumGenre = (albumId, genreId) => {
  return db
    .transaction((trx) => {
      return trx('albumGenres')
        .select('albumId', 'genreId')
        .where({
          albumId: albumId,
          genreId: genreId,
        })
        .then((rows) => {
          // console.log('insertAlbumGenre select result: ', rows);
          if (rows && rows.length > 0) {
            // duplicate albumGenres found
            // console.log('insertAlbumGenre duplicate found: ', albumId, genreId);
            return rows[0];
          } else {
            // no matching records found
            return trx('albumGenres')
              .insert({
                albumId: albumId,
                genreId: genreId,
              })
              .returning(['albumId', 'genreId'])
              .then((rows) => {
                if (rows && rows.length > 0) {
                  return rows[0];
                } else {
                  console.log(
                    'insertAlbumGenre added row but got no results',
                    albumId,
                    genreId
                  );
                  return null;
                }
              })
              .catch((err) => {
                console.log(
                  'insertAlbumGenre insert error (albumId, genreId): ',
                  err.name, err.message,
                  albumId,
                  genreId
                );
                return null;
              });
          }
        })
        .catch((err) => {
          console.log(
            'insertAlbumGenre select error (albumId, genreId): ',
            err.name, err.message,
            albumId,
            genreId
          );
          return null;
        });
    })
    .then((result) => result)
    .catch((err) => {
      console.log(
        'insertAlbumGenre transaction error (albumId, genreId): ',
        err.name, err.message,
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
      console.log('getAlbumGenres error: ', err.name, err.message);
      return null;
    });
};

module.exports = {
  insertSingleAlbum,
  getAlbumsWithNoSpotifyId,
  getAlbumsWithNoMbid,
  getAlbumsWithNoTadbId,
  getAlbumById,
  addSpotifyId,
  addMusicBrainzId,
  addTadbId,
  updateAlbum,
  getAlbumsWithNoGenres,
  insertAlbumGenre,
  getAlbumGenres,
};
