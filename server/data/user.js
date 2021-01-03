const moment = require('moment');
const db = require('./db.js');

const promisify = (fn) => new Promise((resolve) => fn(resolve));

const findUnusedId = async (trx) => {
  // find an unused ID - first try to go under the min, if not go over the max
  let newId;
  const minResult = await trx('user').min('id');
  console.log('findUnusedId min user result: ', minResult);
  const minId =
    minResult && minResult.length > 0 && minResult[0].min
      ? minResult[0].min
      : 0;
  console.log('findUnusedId min id', minId);
  if (minId > 1) {
    newId = minId - 1;
  } else {
    const maxResult = await trx('user').max('id');
    console.log('findUnusedId max user result: ', maxResult);
    const maxId =
      maxResult && maxResult.length > 0 && maxResult[0].max
        ? maxResult[0].max
        : 0;
    console.log('findUnusedId max id', maxId);
    newId = maxId + 1;
  }
  return newId;
};

const initializeSpotifyUser = async (credentials) => {
  const numDeleted = await clearOutOldUsers();
  console.log('initializeSpotifyUser - clearOutOldUsers num deleted', numDeleted);

  const trx = await promisify(db.transaction.bind(db));
  const { spotifyAuthToken } = credentials;

  // for now, don't try to add a user if spotifyAuthToken is undefined
  if (!spotifyAuthToken) {
    console.log('initializeSpotifyUser aborting because access token is empty', numDeleted);
    return 0;
  }

  // do this inside a transaction so any unused ID's we find stay unused until we're done
  try {
    const result = await trx
      .select('id')
      .from('user')
      .where({ spotifyAuthToken: spotifyAuthToken });
    console.log('initializeSpotifyUser current user result: ', result);
    if (result && result.length > 0) {
      console.log('initializeSpotifyUser found current user', result[0].id);
      // await trx.rollback();
      return result[0].id;
    }

    const newId = await findUnusedId(trx);

    if (newId > 0) {
      await trx('user').insert({
        id: newId,
        ...credentials,
      });
    }

    await trx.commit();
    console.log('initializeSpotifyUser commit successful');
    return newId;
  } catch (e) {
    console.log('initializeSpotifyUser error', e);
    await trx.rollback();
    return 0;
  }
};

const initializeOneDriveUser = async (credentials) => {
  const numDeleted = await clearOutOldUsers();
  console.log('initializeOneDriveUser - clearOutOldUsers num deleted', numDeleted);

  const trx = await promisify(db.transaction.bind(db));
  const { oneDriveProfileId } = credentials;
  console.log('initializeOneDriveUser oid: ', oneDriveProfileId);

  // for now, don't try to add a user if oneDriveProfileId is undefined
  if (!oneDriveProfileId) {
    console.log('initializeOneDriveUser aborting because profile ID is empty', numDeleted);
    return 0;
  }

  // do this inside a transaction so any unused ID's we find stay unused until we're done
  try {
    const result = await trx
      .select('id')
      .from('user')
      .where({ oneDriveProfileId: oneDriveProfileId });
    console.log('initializeOneDriveUser current user result: ', result);
    if (result && result.length > 0) {
      console.log('initializeOneDriveUser found current user', result[0].id);
      // await trx.rollback();
      return result[0].id;
    }

    const newId = await findUnusedId(trx);

    if (newId > 0) {
      await trx('user').insert({
        id: newId,
        ...credentials,
      });
    }

    await trx.commit();
    console.log('initializeOneDriveUser commit successful');
    return newId;
  } catch (e) {
    console.log('initializeOneDriveUser error', e);
    await trx.rollback();
    return 0;
  }
};

const getUserFromSpotifyToken = (spotifyAuthToken) => {
  return db
    .select('id')
    .from('user')
    .where('spotifyAuthToken', spotifyAuthToken)
    .then((rows) => {
      if (rows && rows.length > 0) {
        return rows[0].id;
      }
      return 0;
    })
    .catch((err) => console.log('getUserFromSpotifyToken error', err.name, err.message));
}

const getUserFromOneDriveId = (oneDriveProfileId) => {
  return db
    .select('id')
    .from('user')
    .where('oneDriveProfileId', oneDriveProfileId)
    .then((rows) => {
      if (rows && rows.length > 0) {
        return rows[0].id;
      }
      return 0;
    })
    .catch((err) => console.log('getUserFromOneDriveId error', err.name, err.message));
}

const getSpotifyCredentials = (userId) => {
  return db
    .select('spotifyAuthToken', 'spotifyRefreshToken', 'spotifyExpiration')
    .from('user')
    .where('id', userId)
    .first()
    .catch((err) => console.log('getSpotifyCredentials error', err.name, err.message));
};

const getOneDriveCredentials = (userId) => {
  return db
    .select('oneDriveProfileId', 'oneDriveParams', 'oneDriveExpiration')
    .from('user')
    .where('id', userId)
    .first()
    .catch((err) => console.log('getOneDriveCredentials error', err.name, err.message));
};

const updateTokens = (userId, tokens) => {
  console.log('updateTokens for user ', userId);
  return db('user')
    .where({ id: userId })
    .returning(['id','spotifyExpiration', 'oneDriveExpiration'])
    .update(tokens)
    .catch((err) => console.log('updateTokens error', err.name, err.message));
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
  return db
    .transaction((trx) => {
      return trx('userAlbums')
        .select()
        .where({
          userId: userAlbum.userId,
          albumId: userAlbum.albumId,
        })
        .then((rows) => {
          if (rows.length === 0) {
            // no matching records found
            return trx('userAlbums')
              .returning(['userId', 'albumId'])
              .insert(userAlbum)
              .then((rows) => {
                if (rows.length > 0) {
                  return rows[0];
                } else {
                  console.log(
                    'insertSingleUserAlbum added row but got no results',
                    userAlbum
                  );
                  return null;
                }
              })
              .catch((err) =>
                console.log(
                  'insertSingleUserAlbum insert error',
                  err,
                  userAlbum
                )
              );
          } else {
            // duplicate spotifyId found
            if (userAlbum.localId || userAlbum.oneDriveId) {
              // update the record with localId and oneDriveId
              // console.log('insertSingleUserAlbum duplicate found: ', userAlbum);
              return trx('userAlbums')
                .where({
                  userId: userAlbum.userId,
                  albumId: userAlbum.albumId,
                })
                .update(
                  {
                    localId: userAlbum.localId,
                    oneDriveId: userAlbum.oneDriveId,
                  },
                  ['userId', 'albumId']
                )
                .then((rows) => {
                  if (rows.length > 0) {
                    return rows[0];
                  } else {
                    console.log(
                      'insertSingleUserAlbum added row but got no results',
                      userAlbum
                    );
                    return null;
                  }
                })
                .catch((err) =>
                  console.log(
                    'insertSingleUserAlbum update error',
                    err,
                    userAlbum
                  )
                );
            } else {
              // return userAlbum;
              return rows[0];
            }
          }
        })
        .catch((err) => {
          console.log('insertSingleUserAlbum select error: ', err, userAlbum);
          return null;
        });
    })
    .then((result) => {
      // console.log('insertSingleUserAlbum transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log('insertSingleUserAlbum transaction error: ', err, userAlbum);
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
        { spotifyAlbumId: 'album.spotifyId' },
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
        { spotifyAlbumId: 'album.spotifyId' },
        { albumName: 'album.name' },
        { artistName: 'artist.name' },
        { imageUrl: 'album.imageUrl' },
        { releaseDate: 'album.releaseDate' }
      )
      .where('userAlbums.userId', userId);
  }
};

module.exports = {
  initializeSpotifyUser,
  initializeOneDriveUser,
  getUserFromSpotifyToken,
  getUserFromOneDriveId,
  getSpotifyCredentials,
  getOneDriveCredentials,
  updateTokens,
  insertSingleUserAlbum,
  getUserAlbums,
};
