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

const initializeNewUser = async (credentials) => {
  const numDeleted = await clearOutOldUsers();
  console.log('initializeNewUser - clearOutOldUsers num deleted', numDeleted);

  const trx = await promisify(db.transaction.bind(db));
  if (credentials) {
    console.log(
      'initializeNewUser existing spotify/oneDrive credentials: ',
      credentials.spotifyAuthToken,
      credentials.oneDriveProfileId
    );
  } else {
    console.log('initializeNewUser with no credentials');
  }

  // do this inside a transaction so any unused ID's we find stay unused until we're done
  try {
    if (credentials && credentials.spotifyAuthToken) {
      const result = await trx
        .select('id')
        .from('user')
        .where({ spotifyAuthToken: credentials.spotifyAuthToken });
      console.log('initializeNewUser spotify user result: ', result);
      if (result && result.length > 0) {
        console.log('initializeNewUser found current user', result[0].id);
        // await trx.rollback();
        return result[0].id;
      }
    }
    if (credentials && credentials.oneDriveProfileId) {
      const result = await trx
        .select('id')
        .from('user')
        .where({ oneDriveProfileId: credentials.oneDriveProfileId });
      console.log('initializeNewUser oneDrive user result: ', result);
      if (result && result.length > 0) {
        console.log('initializeNewUser found current user', result[0].id);
        // await trx.rollback();
        return result[0].id;
      }
    }

    const newId = await findUnusedId(trx);
    if (newId > 0) {
      await trx('user').insert({
        id: newId,
        ...credentials,
      });
    }

    await trx.commit();
    console.log('initializeNewUser commit successful');
    return newId;
  } catch (e) {
    console.log('initializeNewUser error', e.name, e.message);
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
    .catch((err) =>
      console.log('getUserFromSpotifyToken error', err.name, err.message)
    );
};

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
    .catch((err) =>
      console.log('getUserFromOneDriveId error', err.name, err.message)
    );
};

const getSpotifyCredentials = (userId) => {
  return db
    .select('spotifyAuthToken', 'spotifyRefreshToken', 'spotifyExpiration')
    .from('user')
    .where('id', userId)
    .first()
    .catch((err) =>
      console.log('getSpotifyCredentials error', err.name, err.message)
    );
};

const getOneDriveCredentials = (userId) => {
  return db
    .select('oneDriveProfileId', 'oneDriveParams', 'oneDriveExpiration')
    .from('user')
    .where('id', userId)
    .first()
    .catch((err) =>
      console.log('getOneDriveCredentials error', err.name, err.message)
    );
};

const updateTokens = (userId, tokens) => {
  console.log('updateTokens for user ', userId);
  return db
    .transaction((trx) => {
      // first make sure we have a user to update
      return trx('user')
        .select()
        .where({ id: userId })
        .then((rows) => {
          if (rows.length > 0) {
            // user record found, do the update
            return trx('user')
              .where({ id: userId })
              .update(tokens)
              .catch((err) =>
                console.log('updateTokens update error', err.name, err.message)
              );
          } else {
            // no user was found, create a new one
            console.log(
              'updateTokens - no user found, creating one for userId: ',
              userId
            );
            trx('user')
              .insert({
                id: userId,
                ...tokens,
              })
              .then((result) => {
                // console.log('updateTokens insert result: ', result);
                return result;
              })
              .catch((err) => {
                console.log(
                  'updateTokens insert error: ',
                  err.name,
                  err.message,
                  userId
                );
                return null;
              });
          }
        })
        .catch((err) => {
          console.log(
            'updateTokens select error: ',
            err.name,
            err.message,
            userId
          );
          return null;
        });
    })
    .then((result) => {
      // console.log('updateTokens transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log(
        'updateTokens transaction error: ',
        err.name,
        err.message,
        userId
      );
      return null;
    });
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
            // duplicate record found
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

const removeSingleUserAlbum = (userId, albumId) => {
  return db('userAlbums')
    .where({
      userId: userId,
      albumId: albumId,
    })
    .del();
};

const insertSingleUserArtist = (userArtist) => {
  return db
    .transaction((trx) => {
      return trx('userArtists')
        .select()
        .where({
          userId: userArtist.userId,
          artistId: userArtist.artistId,
        })
        .then((rows) => {
          if (rows.length === 0) {
            // no matching records found
            return trx('userArtists')
              .returning(['userId', 'artistId'])
              .insert(userArtist)
              .then((rows) => {
                if (rows.length > 0) {
                  return rows[0];
                } else {
                  console.log(
                    'insertSingleUserArtist added row but got no results',
                    userArtist
                  );
                  return null;
                }
              })
              .catch((err) =>
                console.log(
                  'insertSingleUserArtist insert error',
                  err.name,
                  err.message,
                  userArtist
                )
              );
          } else {
            // duplicate record found
            // return userArtist record;
            return rows[0];
          }
        })
        .catch((err) => {
          console.log(
            'insertSingleUserArtist select error: ',
            err.name,
            err.message,
            userArtist
          );
          return null;
        });
    })
    .then((result) => {
      // console.log('insertSingleUserArtist transaction result: ', result);
      return result;
    })
    .catch((err) => {
      console.log(
        'insertSingleUserArtist transaction error: ',
        err.name,
        err.message,
        userArtist
      );
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

const getUserArtists = (userId) => {
  return db
    .from('userArtists')
    .innerJoin('artist', 'userArtists.artistId', 'artist.id')
    .select(
      { artistId: 'artist.id' },
      { spotifyArtistId: 'artist.spotifyId' },
      { musicBrainzArtistId: 'artist.musicBrainzId' },
      { tadbArtistId: 'artist.tadbId' },
      { artistName: 'artist.name' },
      { imageUrl: 'artist.imageUrl' }
    )
    .where('userArtists.userId', userId);
};

const clearUserSpotifyAlbums = (userId) => {
  return db('userAlbums')
    .where('userId', userId)
    .whereNull('localId')
    .whereNull('oneDriveId')
    .delete()
    .catch((err) => {
      console.log(
        'clearUserSpotifyAlbums error: ',
        err.name,
        err.message,
        userId
      );
    });
};

const clearUserOneDriveAlbums = (userId) => {
  return db('userAlbums')
    .where('userId', userId)
    .whereNotNull('oneDriveId')
    .where('localId', -1)
    .delete()
    .catch((err) => {
      console.log(
        'clearUserOneDriveAlbums error: ',
        err.name,
        err.message,
        userId
      );
    });
};

module.exports = {
  initializeNewUser,
  getUserFromSpotifyToken,
  getUserFromOneDriveId,
  getSpotifyCredentials,
  getOneDriveCredentials,
  updateTokens,
  insertSingleUserAlbum,
  removeSingleUserAlbum,
  insertSingleUserArtist,
  getUserAlbums,
  getUserArtists,
  clearUserSpotifyAlbums,
  clearUserOneDriveAlbums,
};
