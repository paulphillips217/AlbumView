const db = require('./db.js');

const promisify = (fn) => new Promise((resolve, reject) => fn(resolve));

const initializeUser = async (credentials) => {
  const { access_token, refresh_token, token_expiration } = credentials;
  const trx = await promisify(db.transaction.bind(db));

  try {
    const userId = await trx
      .select('id')
      .from('user')
      .where({ spotifyAuthToken: access_token }).first();
    console.log('initializeUser current user result: ', userId);
    if (userId) {
      console.log('initializeUser found current user', userId);
      await trx.rollback();
      return userId;
    }

    const result = await trx('user').max('id').first();
    console.log('initializeUser max user result: ', result);
    const maxId =
      result && result.max ? result.max : 0;
    console.log('initializeUser max id', maxId);

    await trx('user').insert({
      id: maxId + 1,
      spotifyAuthToken: access_token,
      spotifyRefreshToken: refresh_token,
      spotifyExpiration: token_expiration,
    });

    await trx.commit();
    console.log('initializeUser commit successful');
    return maxId + 1;

  } catch (e) {
    console.log('initializeUser error', e);
    await trx.rollback();
    return 0;
  }
};

const getCredentials = (userId) => {
  return db.select('spotifyAuthToken', 'spotifyRefreshToken', 'spotifyExpiration')
    .from('user')
    .where('id', userId).first();
}

module.exports = {
  initializeUser,
  getCredentials
};
