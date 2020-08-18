const db = require('./db.js');

// from https://dev.to/vvo/upserts-in-knex-js-1h4o
const insertFromSpotify = (artists) => {
  db.raw(
    `? ON CONFLICT spotifyId
            DO NOTHING
            RETURNING *;`,
    [db("album").insert(artists)],
  );
}

const insertSingleArtist = async () => {
  return db('artist').insert({
    spotifyId: 'abc123',
    name: 'test artist',
  });
}

module.exports = {
  insertSingleArtist,
};
