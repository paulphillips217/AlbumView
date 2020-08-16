const db = require('./db.js');

// from https://dev.to/vvo/upserts-in-knex-js-1h4o
const insertFromSpotify = (albums) => {
  db.raw(
    `? ON CONFLICT spotifyId
            DO NOTHING
            RETURNING *;`,
    [db("album").insert(albums)],
  );
}
