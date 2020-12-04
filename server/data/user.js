const moment = require('moment');
const db = require('./db.js');

const promisify = (fn) => new Promise((resolve) => fn(resolve));

const initializeUser = async (credentials) => {
  const numDeleted = await clearOutOldUsers();
  console.log('clearOutOldUsers num deleted', numDeleted);

  const { access_token, refresh_token, token_expiration } = credentials;
  const trx = await promisify(db.transaction.bind(db));

  // do this inside a transaction so any unused ID's we find stay unused until we're done
  try {
    const userId = await trx
      .select('id')
      .from('user')
      .where({ spotifyAuthToken: access_token });
    console.log('initializeUser current user result: ', userId);
    if (userId && userId.length > 0) {
      console.log('initializeUser found current user', userId);
      await trx.rollback();
      return userId[0];
    }

    // find an unused ID - first try to go under the min, if not go over the max
    let newId;
    const minResult = await trx('user').min('id');
    console.log('initializeUser min user result: ', minResult);
    const minId =
      minResult && minResult.length > 0 && minResult[0].min
        ? minResult[0].min
        : 0;
    console.log('initializeUser min id', minId);
    if (minId > 1) {
      newId = minId - 1;
    } else {
      const maxResult = await trx('user').max('id');
      console.log('initializeUser max user result: ', maxResult);
      const maxId =
        maxResult && maxResult.length > 0 && maxResult[0].max
          ? maxResult[0].max
          : 0;
      console.log('initializeUser max id', maxId);
      newId = maxId + 1;
    }

    if (newId > 0) {
      await trx('user').insert({
        id: newId,
        spotifyAuthToken: access_token,
        spotifyRefreshToken: refresh_token,
        spotifyExpiration: token_expiration,
      });
    }

    await trx.commit();
    console.log('initializeUser commit successful');
    return newId;
  } catch (e) {
    console.log('initializeUser error', e);
    await trx.rollback();
    return 0;
  }
};

const getCredentials = (userId) => {
  return db
    .select('spotifyAuthToken', 'spotifyRefreshToken', 'spotifyExpiration')
    .from('user')
    .where('id', userId)
    .first();
};

const updateSpotifyTokens = (userId, tokens) => {
  console.log('updateSpotifyTokens with ', tokens);
  db('user')
    .where({ id: userId })
    .update(tokens)
    .catch((err) => console.log('updateSpotifyTokens error', err));
};

const clearOutOldUsers = () => {
  console.log('clearOutOldUsers');
  const threshold = moment().subtract(
    parseInt(process.env.JWT_EXPIRATION_HOURS) * 4,
    'hours'
  );
  console.log(
    'clearOutOldUsers threshold: ',
    threshold.format('YYYY-MM-DDThh:mm:ssZ')
  );
  return db('user').where('spotifyExpiration', '<', threshold).del();
};

const insertSingleUserAlbum = (userAlbum) => {
  return db('userAlbums')
    .select()
    .where({
      userId: userAlbum.userId,
      albumId: userAlbum.albumId,
    })
    .then((rows) => {
      if (rows.length === 0) {
        // no matching records found
        return db('userAlbums')
          .returning(['userId', 'albumId'])
          .insert(userAlbum)
          .then((rows) => {
            if (rows.length > 0) {
              return rows[0];
            } else {
              console.log('insertSingleUserAlbum added row but got no results');
              return null;
            }
          })
          .catch((err) =>
            console.log('insertSingleUserAlbum insert error', err)
          );
      } else {
        // duplicate spotifyId found, update the record with localId and oneDriveId
        // console.log('insertSingleUserAlbum duplicate found: ', userAlbum);
        return db('userAlbums')
          .where({
            userId: userAlbum.userId,
            albumId: userAlbum.albumId,
          })
          .update(
            { localId: userAlbum.localId, oneDriveId: userAlbum.oneDriveId },
            ['userId', 'albumId']
          )
          .then((rows) => {
            if (rows.length > 0) {
              return rows[0];
            } else {
              console.log('insertSingleUserAlbum added row but got no results');
              return null;
            }
          })
          .catch((err) =>
            console.log('insertSingleUserAlbum update error', err)
          );
        // return userAlbum;
      }
    })
    .catch((err) => {
      console.log('insertSingleUserAlbum error: ', err);
      return null;
    });
};

const getUserAlbums = (userId, genreId = 0) => {
  console.log('getUserAlbums genre: ', genreId);
  if (genreId > 0) {
    return db
      .from('userAlbums')
      .innerJoin('album', 'userAlbums.albumId', 'album.id')
      .innerJoin('artist', 'album.artistId', 'artist.id')
      .innerJoin('albumGenres', 'album.id', 'albumGenres.albumId')
      .select(
        { albumId: 'album.id' },
        { localId: 'userAlbums.localId' },
        { oneDriveId: 'userAlbums.oneDriveId' },
        { spotifyId: 'album.spotifyId' },
        { albumName: 'album.name' },
        { artistName: 'artist.name' },
        { imageUrl: 'album.imageUrl' },
        { releaseDate: 'album.releaseDate' }
      )
      .where('userAlbums.userId', userId)
      .andWhere('albumGenres.genreId', genreId);
  } else {
    return db
      .from('userAlbums')
      .innerJoin('album', 'userAlbums.albumId', 'album.id')
      .innerJoin('artist', 'album.artistId', 'artist.id')
      .select(
        { albumId: 'album.id' },
        { localId: 'userAlbums.localId' },
        { oneDriveId: 'userAlbums.oneDriveId' },
        { spotifyId: 'album.spotifyId' },
        { albumName: 'album.name' },
        { artistName: 'artist.name' },
        { imageUrl: 'album.imageUrl' },
        { releaseDate: 'album.releaseDate' }
      )
      .where('userAlbums.userId', userId);
  }
};

module.exports = {
  initializeUser,
  getCredentials,
  updateSpotifyTokens,
  insertSingleUserAlbum,
  getUserAlbums,
};
