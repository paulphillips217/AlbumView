const db = require('./db.js');
const utilities = require('../utilities');

const insertSingleArtist = (artist) => {
  artist.matchName = utilities.makeMatchName(artist.name);
  return db
    .transaction((trx) => {
      if (artist.spotifyId) {
        return trx('artist')
          .select()
          .where('spotifyId', artist.spotifyId)
          .then((rows) => {
            if (rows && rows.length > 0) {
              return returnOrInsertArtist(trx, rows, artist);
            } else {
              // if spotify id not found, it still may be in database without an id
              return trx('artist')
                .select()
                .where('matchName', artist.matchName)
                .then((rows) => returnOrInsertArtist(trx, rows, artist))
                .catch((err) => {
                  console.log('insertSingleArtist select error: ', err, artist);
                  return null;
                });
            }
          })
          .catch((err) => {
            console.log('insertSingleArtist select error: ', err, artist);
            return null;
          });
      } else {
        return trx('artist')
          .select()
          .where('matchName', artist.matchName)
          .then((rows) => returnOrInsertArtist(trx, rows, artist))
          .catch((err) => {
            console.log('insertSingleArtist select error: ', err, artist);
            return null;
          });
      }
    })
    .then((result) => {
      // console.log('insertSingleArtist transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log('insertSingleArtist transaction error: ', err, artist);
      return null;
    });
};

const returnOrInsertArtist = (trx, rows, artist) => {
  if (rows && rows.length > 0) {
    // duplicate record found
    // console.log('insertSingleArtist duplicate found: ', rows);
    if (artist.spotifyId && !(rows[0].spotifyId)) {
      // updating artist record to include spotifyId
      trx('artist')
        .where('id', rows[0].id)
        .update({ spotifyId: artist.spotifyId, name: artist.name })
        .then((result) => {
          console.log('insertSingleArtist update result: ', result);
        })
        .catch((err) => {
          console.log('insertSingleArtist update error: ', err, artist);
        });
    }
    return rows[0].id;
  } else {
    // no matching records found
    return trx('artist')
      .returning('id')
      .insert(artist)
      .then((rows) => {
        if (rows && rows.length > 0) {
          // console.log('insertSingleArtist inserted: ', rows);
          return rows[0];
        } else {
          console.log('insertSingleArtist added row but got no results');
          return null;
        }
      })
      .catch((err) => {
        console.log('insertSingleArtist insert error: ', err, artist);
        return null;
      });
  }
};

const getArtistsWithNoSpotifyId = () => {
  console.log('getArtistsWithNoSpotifyId');
  return db
    .from('artist')
    .whereNull('spotifyId')
    .select(
      { artistId: 'id' },
      { artistName: 'name' }
    )
    .catch((err) => console.log('getArtistsWithNoSpotifyId error', err.name, err.message));
};

const getArtistsWithNoMbId = () => {
  console.log('getArtistsWithNoMbId');
  return db
    .from('artist')
    .whereNull('musicBrainzId')
    .select(
      { artistId: 'id' },
      { artistName: 'name' }
    )
    .catch((err) => console.log('getArtistsWithNoMbId error', err.name, err.message));
};

const getArtistsWithNoTadbId = () => {
  console.log('getArtistsWithNoTadbId');
  return db
    .from('artist')
    .whereNull('tadbId')
    .select(
      { artistId: 'id' },
      { artistName: 'name' }
    )
    .catch((err) => console.log('getArtistsWithNoTadbId error', err.name, err.message));
};

const getSpotifyArtistsWithNoImageUrl = () => {
  console.log('getSpotifyArtistsWithNoImageUrl');
  return db
    .from('artist')
    .whereNotNull('spotifyId')
    .whereNull('imageUrl')
    .select(
      { artistId: 'id' },
      { spotifyId: 'spotifyId' }
    )
    .catch((err) => console.log('getSpotifyArtistsWithNoImageUrl error', err.name, err.message));
};

const getArtistById = (artistId) => {
  // console.log('getArtistById');
  return db
    .from('artist')
    .where({ id: artistId})
    .then((rows) => {
      if (rows && rows.length > 0) {
        // console.log('getArtistById got: ', rows);
        return rows[0];
      } else {
        console.log('getArtistById got no results');
        return null;
      }
    })
    .catch((err) => console.log('getArtistById error', err.name, err.message));
};

const updateArtist = (artistId, artist) => {
  console.log('updateArtist for artist ', artistId);
  return db('artist')
    .where({ id: artistId })
    .update(artist)
    .catch((err) => console.log('updateArtist error', err.name, err.message));
};

module.exports = {
  insertSingleArtist,
  getArtistsWithNoSpotifyId,
  getArtistsWithNoMbId,
  getArtistsWithNoTadbId,
  getSpotifyArtistsWithNoImageUrl,
  getArtistById,
  updateArtist,
};
