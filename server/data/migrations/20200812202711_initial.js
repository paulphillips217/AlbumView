exports.up = (knex) => {
  return knex.schema
    .dropTableIfExists('credentials')
    .createTable('artist', (artist) => {
      artist.increments('id').primary();
      artist.string('spotifyId', 64);
      artist.string('musicBrainzId', 64);
      artist.string('name', 128).notNullable();
      artist.string('imageUrl', 512);
    })
    .createTable('album', (album) => {
      album.increments('id').primary();
      album
        .integer('artistId')
        .references('id')
        .inTable('artist')
        .notNull()
        .onDelete('cascade');
      album.string('spotifyId', 64);
      album.string('musicBrainzId', 64);
      album.string('name', 128).notNullable();
      album.string('imageUrl', 512);
    })
    .createTable('track', (track) => {
      track.increments('id').primary();
      track
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      track.string('spotifyId', 64);
      track.string('musicBrainzId', 64);
      track.integer('cdNumber').notNullable();
      track.integer('trackNumber').notNullable();
      track.string('name', 128).notNullable();
    })
    .createTable('genre', (genre) => {
      genre.increments('id').primary();
      genre.string('name', 128).notNullable();
    })
    .createTable('albumGenres', (albumGenre) => {
      albumGenre
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      albumGenre
        .integer('genreId')
        .references('id')
        .inTable('genre')
        .notNull()
        .onDelete('cascade');
      albumGenre.primary(['albumId', 'genreId']);
    })
    .createTable('user', (user) => {
      user.integer('id').primary();
      user.string('spotifyAuthToken', 512).notNullable();
      user.string('spotifyRefreshToken', 512).notNullable();
      user.datetime('spotifyExpiration').notNullable();
    })
    .createTable('userAlbums', (albumGenre) => {
      albumGenre
        .integer('userId')
        .references('id')
        .inTable('user')
        .notNull()
        .onDelete('cascade');
      albumGenre
        .integer('albumId')
        .references('id')
        .inTable('album')
        .notNull()
        .onDelete('cascade');
      albumGenre.primary(['userId', 'albumId']);
    });
};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('userAlbums')
    .dropTableIfExists('user')
    .dropTableIfExists('albumGenre')
    .dropTableIfExists('genre')
    .dropTableIfExists('track')
    .dropTableIfExists('album')
    .dropTableIfExists('artist');
};
