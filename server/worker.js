if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log('worker environment', result.parsed);
}

// most of this worker code is taken from the example at https://github.com/heroku-examples/node-workers-example

// notes on spotify rate limiting:
// from website https://developer.spotify.com/documentation/web-api/
// Note: If Web API returns status code 429, it means that you have sent too many requests.
// When this happens, check the Retry-After header, where you will see a number displayed.
// This is the number of seconds that you need to wait, before you try your request again.

let throng = require('throng');
let Queue = require('bull');

const album = require('./data/album');
const artist = require('./data/artist');
const genre = require('./data/genre');
const spotifyData = require('./spotifyData');
const lastFmData = require('./lastFmData');
const theAudioDbData = require('./theAudioDbData');

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = +process.env.WEB_CONCURRENCY || 1;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = +process.env.MAX_JOBS_PER_WORKER || 50;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const start = async () => {
  // Connect to the named work queues
  let testQueue = new Queue('test', process.env.REDIS_URL);
  let savedAlbumQueue = new Queue('savedAlbums', process.env.REDIS_URL);
  let lastAlbumQueue = new Queue('lastAlbums', process.env.REDIS_URL);
  let audioDbAlbumQueue = new Queue('audioDbAlbums', process.env.REDIS_URL);

  console.log('starting worker process');

  testQueue.process(maxJobsPerWorker, async (job) => {
    // This is an example job that just slowly reports on progress
    // while doing no work. Replace this with your own job logic.
    let progress = 0;
    console.log('test queue processing a job from the queue', job.data);
    /*
    while (progress < 100) {
      await sleep(50);
      progress += 1;
      job.progress(progress)
    }
    */
    //    const artist = await artist.insertSingleArtist();
    //    console.log('inserted single artist', artist);

    // A job can return values that will be stored in Redis as JSON
    // This return value is unused in this demo application.
    return { value: 'This will be stored' };
  });

  // gets the user's saved albums from Spotify
  savedAlbumQueue.process(maxJobsPerWorker, async (job) => {
    const { userId, count } = job.data;
    console.log(
      `savedAlbumQueue processing a job from the queue, user: ${userId}, count: ${count}`
    );

    let offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < count) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getSavedAlbums(userId, offset);
      job.progress(count > 0 ? (100 * offset / count) : 100);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      // console.log(`savedAlbumQueue count and offset: ${offset}, count: ${count}`);
    }

    job.progress(100);
    console.log('savedAlbumQueue processing completed');

    console.log('savedAlbumQueue starting the audio db queue');
    // await lastAlbumQueue.add();
    await audioDbAlbumQueue.add();
  });

  // gets information for albums from Last.fm
  lastAlbumQueue.process(maxJobsPerWorker, async (job) => {
    console.log('lastAlbumQueue starting');
    const albums = await album.getAlbumsWithNoMbid();
    console.log('getAlbumsWithNoMbid album count', albums.length);

    if (albums) {
      for (let i = 0; i < albums.length; i++) {
        await sleep(process.env.LAST_FM_INTERVAL);
        let musicBrainzId = await lastFmData.getMusicBrainzId(
          albums[i].artistName,
          albums[i].albumName
        );
        console.log('lastAlbumQueue musicBrainzId', musicBrainzId);
        if (!musicBrainzId) {
          musicBrainzId = 'NOT-FOUND';
        }
        await album.addMusicBrainzId(albums[i].albumId, musicBrainzId);
      }
    }

    const genrelessAlbums = await album.getAlbumsWithNoGenres();
    console.log('getAlbumsWithNoGenres album count', genrelessAlbums.length);
    if (genrelessAlbums) {
      for (let i = 0; i < genrelessAlbums.length; i++) {
        // for now, skip albums whose musicBrainzId is NOT-FOUND
        if (genrelessAlbums[i].musicBrainzId === 'NOT-FOUND') {
          continue;
        }
        await sleep(process.env.LAST_FM_INTERVAL);
        let genres = await lastFmData.getAlbumGenres(
          genrelessAlbums[i].musicBrainzId,
          genrelessAlbums[i].artistName,
          genrelessAlbums[i].albumName
        );

        if (genres) {
          for (let j = 0; j < genres.length; j++) {
            console.log('lastAlbumQueue album genre', genres[j]);
            const { count, name } = genres[j];
            if (count >= 10) {
              const genreRecord = await genre.insertGenre(name);
              const albumGenre = await album.insertAlbumGenre(
                genrelessAlbums[i].albumId,
                genreRecord.id
              );
              console.log(
                'lastAlbumQueue albumGenreRecord',
                genrelessAlbums[i].albumId,
                genreRecord.id
              );
            }
          }
        }
      }
    }
  });

  // gets information for albums from theAudioDb.com
  audioDbAlbumQueue.process(maxJobsPerWorker, async (job) => {
    // console.log('audioDbAlbumQueue starting');
    const albums = await album.getAlbumsWithNoTadbId();
    console.log('getAlbumsWithNoTadbId album count', albums.length);

    if (albums) {
      let tadbId;
      for (let i = 0; i < albums.length; i++) {
        await sleep(process.env.THE_AUDIO_DB_INTERVAL);
        let albumData = await theAudioDbData.getAlbumData(
          albums[i].artistName,
          albums[i].albumName
        );
        // if we didn't get a result, try removing everything between parentheses
        if (
          (!albumData || !albumData.idAlbum) &&
          (albums[i].albumName.includes('&') ||
            albums[i].albumName.includes('(') ||
            albums[i].albumName.includes('/'))
        ) {
          const albumName = albums[i].albumName
            .replace(/\(.+\)/g, '')
            .replace(/&/g, 'and')
            .replace(/ \/ /g, '/');
          console.log(
            `trying to search for ${albumName} instead of ${albums[i].albumName}`
          );
          await sleep(process.env.THE_AUDIO_DB_INTERVAL);
          albumData = await theAudioDbData.getAlbumData(
            albums[i].artistName,
            albumName
          );
        }
        //console.log('audioDbAlbumQueue albumData', albumData);
        if (albumData && albumData.idAlbum) {
          tadbId = albumData.idAlbum;
        } else {
          tadbId = 'NOT-FOUND';
        }
        await album.addTadbId(albums[i].albumId, tadbId);
        if (albumData) {
          if (albumData.strStyle) {
            const genreRecord = await genre.insertGenre(albumData.strStyle);
            if (genreRecord && genreRecord.id) {
              await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
              // console.log('audioDbAlbumQueue strStyle albumGenreRecord', genre, albums[i].albumId, genreRecord.id);
            } else {
              // console.log('audioDbAlbumQueue no albumData.strStyle', albums[i].albumId, albumData.strStyle);
            }
          }
          if (albumData.strGenre) {
            const genreRecord = await genre.insertGenre(albumData.strGenre);
            if (genreRecord && genreRecord.id) {
              await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
              // console.log('audioDbAlbumQueue strGenre albumGenreRecord',albums[i].albumId,genreRecord.id);
            } else {
              // console.log('audioDbAlbumQueue no albumData.strGenre',albums[i].albumId,albumData.strGenre);
            }
          }
          if (albumData.strMood) {
            const genreRecord = await genre.insertGenre(albumData.strMood);
            if (genreRecord && genreRecord.id) {
              await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
              // console.log('audioDbAlbumQueue strMood albumGenreRecord', albums[i].albumId, genreRecord.id);
            } else {
              // console.log('audioDbAlbumQueue no albumData.strMood', albums[i].albumId, albumData.strMood);
            }
          }
        }
      }
    }
  });
};

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
