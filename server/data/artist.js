const db = require('./db.js');

const insertSingleArtist = (artist) => {
  return db('artist')
    .select()
    .where('spotifyId', artist.spotifyId)
    .then((rows) => {
      if (rows.length === 0) {
        // no matching records found
        return db('artist')
          .returning('id')
          .insert(artist);
      } else {
        // duplicate spotifyId found
        // console.log('insertSingleArtist duplicate found: ', artist.spotifyId);
        return [rows[0].id];
      }
    })
    .catch((err) => {
      console.log('insertSingleArtist error: ', err)
      return null;
    });
};

module.exports = {
  insertSingleArtist,
};
