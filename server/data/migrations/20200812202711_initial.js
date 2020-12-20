exports.up = async (knex) => {
  let result;
  let hasTable
  result = await knex.schema.dropTableIfExists('credentials');
  hasTable = await knex.schema.hasTable('artist');
  if (hasTable) {
    console.log('artist table already exists');
  } else {
    result = await knex.schema.createTable('artist', (artist) => {
      artist.increments('id').primary();
      artist.string('spotifyId', 64);
      artist.string('musicBrainzId', 64);
      artist.string('tadbId', 64);
      artist.string('name', 128).notNullable();
      artist.string('matchName', 128).notNullable();
      artist.string('imageUrl', 512);
    })
  }
  hasTable = await knex.schema.hasTable('album');
  if (hasTable) {
    console.log('album table already exists');
  } else {
    result = await knex.schema.createTable('album', (album) => {
      album.increments('id').primary();
      album
        .integer('artistId')
        .references('id')
        .inTable('artist')
        .notNull()
        .onDelete('cascade');
      album.string('spotifyId', 64);
      album.string('musicBrainzId', 64);
      album.string('tadbId', 64);
      album.string('name', 128).notNullable();
      album.string('matchName', 128).notNullable();
      album.string('imageUrl', 512);
      album.datetime('releaseDate');
    })
  }
  hasTable = await knex.schema.hasTable('track');
  if (hasTable) {
    console.log('track table already exists');
  } else {
    result = await knex.schema.createTable('track', (track) => {
      track.increments('id').primary();
      track
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      track.string('spotifyId', 64);
      track.string('musicBrainzId', 64);
      track.string('tadbId', 64);
      track.integer('cdNumber').notNullable();
      track.integer('trackNumber').notNullable();
      track.string('name', 128).notNullable();
    })
  }
  hasTable = await knex.schema.hasTable('genre');
  if (hasTable) {
    console.log('genre table already exists');
  } else {
    result = await knex.schema.createTable('genre', (genre) => {
      genre.increments('id').primary();
      genre.string('name', 128).notNullable();
    })
  }
  hasTable = await knex.schema.hasTable('albumGenres');
  if (hasTable) {
    console.log('albumGenres table already exists');
  } else {
    result = await knex.schema.createTable('albumGenres', (albumGenres) => {
      albumGenres
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      albumGenres
        .integer('genreId')
        .references('id')
        .inTable('genre')
        .notNull()
        .onDelete('cascade');
      albumGenres.primary(['albumId', 'genreId']);
    })
  }
  hasTable = await knex.schema.hasTable('user');
  if (hasTable) {
    console.log('user table already exists');
  } else {
    result = await knex.schema.createTable('user', (user) => {
      user.integer('id').primary();
      user.string('spotifyAuthToken', 512).notNullable();
      user.string('spotifyRefreshToken', 512).notNullable();
      user.datetime('spotifyExpiration').notNullable();
    })
  }
  hasTable = await knex.schema.hasTable('userAlbums');
  if (hasTable) {
    console.log('userAlbums table already exists');
  } else {
    result = await knex.schema.createTable('userAlbums', (userAlbums) => {
      userAlbums
        .integer('userId')
        .references('id')
        .inTable('user')
        .notNull()
        .onDelete('cascade');
      userAlbums
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      userAlbums.integer('localId', 64);
      userAlbums.string('oneDriveId', 64);
      userAlbums.primary(['userId', 'albumId']);
    });
  }
};

exports.down = async (knex) => {
  let result;
  result = await knex.schema.dropTableIfExists('userAlbums');
  result = await knex.schema.dropTableIfExists('user');
  result = await knex.schema.dropTableIfExists('albumGenres');
  result = await knex.schema.dropTableIfExists('genre');
  result = await knex.schema.dropTableIfExists('track');
  result = await knex.schema.dropTableIfExists('album');
  result = await knex.schema.dropTableIfExists('artist');
  return result;
};
