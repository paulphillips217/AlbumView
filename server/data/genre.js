const db = require('./db.js');

const insertGenre = (name) => {
  return db
    .transaction((trx) => {
      return trx('genre')
        .select()
        .where('name', name)
        .then((rows) => {
          if (rows.length === 0) {
            // no matching records found
            return trx('genre')
              .returning(['id', 'name'])
              .insert({ name: name })
              .then((rows) => {
                if (rows.length > 0) {
                  return rows[0];
                } else {
                  console.log('insertGenre added row but got no results', name);
                  return null;
                }
              })
              .catch((err) => {
                console.log('insertGenre insert error: ', err, name);
                return null;
              });
          } else {
            // duplicate genre found
            // console.log('insertGenre duplicate found: ', name);
            return rows[0];
          }
        })
        .catch((err) => {
          console.log('insertGenre select error: ', err, name);
          return null;
        });
    })
    .then((result) => {
      // console.log('insertGenre transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log('insertGenre transaction error: ', err, name);
      return null;
    });
};

const getGenres = (userId) => {
  /*
  // this way gets the album count for each genre
  const genreId = db.ref('genre.id');
  const albumCount = db('albumGenres')
    .count('*')
    .where('genreId', genreId)
    .as('albumCount');
  return db
    .from('userAlbums')
    .innerJoin('album', 'userAlbums.albumId', 'album.id')
    .innerJoin('albumGenres', 'album.id', 'albumGenres.albumId')
    .innerJoin('genre', 'albumGenres.genreId', 'genre.id')
    .distinct('genre.id as genreId', 'genre.name as genreName', albumCount)
    .where('userAlbums.userId', userId);
  */
  return db
    .from('genre')
    .distinct('genre.id as genreId', 'genre.name as genreName');
};

const getGenreAlbums = (userId, genreId) => {
  return db
    .from('userAlbums')
    .innerJoin('album', 'userAlbums.albumId', 'album.id')
    .innerJoin('albumGenres', 'album.id', 'albumGenres.albumId')
    .innerJoin('artist', 'album.artistId', 'artist.id')
    .select(
      { albumId: 'album.id' },
      { spotifyId: 'album.spotifyId' },
      { albumName: 'album.name' },
      { artistName: 'artist.name' },
      { imageUrl: 'album.imageUrl' },
      { releaseDate: 'album.releaseDate' }
    )
    .where('userAlbums.userId', userId)
    .andWhere('albumGenres.genreId', genreId);
};

module.exports = {
  insertGenre,
  getGenres,
  getGenreAlbums,
};
