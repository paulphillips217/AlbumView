const db = require('./db.js');

const insertSingleAlbum = (album) => {
  return db('album')
    .select()
    .where('spotifyId', album.spotifyId)
    .then((rows) => {
      if (rows.length === 0) {
        // no matching records found
        return db('album')
          .returning('id')
          .insert(album);
      } else {
        // duplicate spotifyId found
        // console.log('insertSingleAlbum duplicate found: ', album.spotifyId);
        return [rows[0].id];
      }
    })
    .catch((err) => {
      console.log('insertSingleAlbum error: ', err)
      return null;
    });
};

const getAlbumsWithNoMbid = () => {
  return db
    .from('album')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .whereNull('album.musicBrainzId')
    .select(
      { albumId: 'album.id' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' },
    );
};

const addMusicBrainzId = (albumId, musicBrainzId) => {
  console.log('addMusicBrainzId ', albumId, musicBrainzId);
  db('album')
    .where({ id: albumId })
    .update('musicBrainzId', musicBrainzId)
    .catch((err) => console.log('addMusicBrainzId error', err));
}

module.exports = {
  insertSingleAlbum,
  getAlbumsWithNoMbid,
  addMusicBrainzId,
};
