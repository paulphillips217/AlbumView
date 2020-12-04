const db = require('./db.js');

const insertSingleArtist = (artist) => {
  if (artist.spotifyId) {
    return db('artist')
      .select()
      .where('spotifyId', artist.spotifyId)
      .then((rows) => returnOrInsertArtist(rows, artist))
      .catch((err) => {
        console.log('insertSingleArtist error: ', err);
        return null;
      });
  } else {
    return db('artist')
      .select()
      .where('name', artist.name)
      .then((rows) => returnOrInsertArtist(rows, artist))
      .catch((err) => {
        console.log('insertSingleArtist error: ', err);
        return null;
      });
  }
};

const returnOrInsertArtist = (rows, artist) => {
  if (rows && rows.length > 0) {
    // duplicate spotifyId found
    // console.log('insertSingleArtist duplicate found: ', rows);
    return rows[0].id;
  } else {
    // no matching records found
    return db('artist')
      .returning('id')
      .insert(artist)
      .then((rows) => {
        if (rows.length > 0) {
          // console.log('insertSingleArtist inserted: ', rows);
          return rows[0];
        } else {
          console.log('insertSingleArtist added row but got no results');
          return null;
        }
      });
  }
};

module.exports = {
  insertSingleArtist,
};
