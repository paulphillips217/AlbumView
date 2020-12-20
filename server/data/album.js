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
                  console.log('insertSingleAlbum select error: ', err, album);
                  return null;
                });
            }
          })
          .catch((err) => {
            console.log('insertSingleAlbum select error: ', err, album);
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
            console.log('insertSingleAlbum select error: ', err, album);
            return null;
          });
      }
    })
    .then((result) => {
      // console.log('insertSingleAlbum transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log('insertSingleAlbum transaction error: ', err, album);
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
          console.log('insertSingleAlbum update error: ', err, album);
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
        console.log('insertSingleAlbum insert error: ', err, album);
        return null;
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
  // console.log('addTadbId ', albumId, tadbId);
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
                  err,
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
            err,
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
  insertAlbumGenre,
  getAlbumGenres,
};
