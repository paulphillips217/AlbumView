if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log('worker environment', result.parsed);
}

// most of this worker code is taken from the example at https://github.com/heroku-examples/node-workers-example

// notes to clean out redis database
// "redis-cli" starts redis cli
// "keys *" displays all keys
// "flushdb" deletes all keys
// "quit" exits redis cli

// notes on spotify rate limiting:
// from website https://developer.spotify.com/documentation/web-api/
// Note: If Web API returns status code 429, it means that you have sent too many requests.
// When this happens, check the Retry-After header, where you will see a number displayed.
// This is the number of seconds that you need to wait, before you try your request again.

const throng = require('throng');
const Queue = require('bull');

const spotifyData = require('./spotifyData');
const lastFmData = require('./lastFmData');
const theAudioDbData = require('./theAudioDbData');

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
const workers = +process.env.WEB_CONCURRENCY || 1;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
const maxJobsPerWorker = +process.env.MAX_JOBS_PER_WORKER || 50;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const start = async () => {
  // Connect to the named work queues
  const testQueue = new Queue('test', process.env.REDIS_URL);
  const savedAlbumQueue = new Queue('savedAlbums', process.env.REDIS_URL);
  const spotifyAlbumArtistQueue = new Queue(
    'spotifyAlbumsArtists',
    process.env.REDIS_URL
  );
  const lastAlbumQueue = new Queue('lastAlbums', process.env.REDIS_URL);
  const audioDbAlbumQueue = new Queue('audioDbAlbums', process.env.REDIS_URL);

  console.log('starting worker process');

  // *** TEST QUEUE ***
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

    // A job can return values that will be stored in Redis as JSON
    // This return value is unused in this demo application.
    return { value: 'This will be stored' };
  });

  // *** SAVED ALBUM QUEUE ***
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
      job.progress(count > 0 ? Math.floor((100 * offset) / count) : 100);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      // console.log(`savedAlbumQueue count and offset: ${offset}, count: ${count}`);
    }

    job.progress(100);
    console.log('savedAlbumQueue processing completed');

    // now let's do followed artists (don't track progress here)
    await sleep(process.env.SPOTIFY_INTERVAL);
    const followedArtistCount = await spotifyData.getFollowedArtists(userId, 0);
    offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < followedArtistCount) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getFollowedArtists(userId, offset);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      console.log(`savedAlbumQueue followedArtistCount and offset: ${offset}, followedArtistCount: ${followedArtistCount}`);
    }

    // and now artists from saved tracks (again, don't track progress here)
    await sleep(process.env.SPOTIFY_INTERVAL);
    const savedTrackArtistCount = await spotifyData.getSavedTrackArtists(userId, 0);
    offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < savedTrackArtistCount) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getSavedTrackArtists(userId, offset);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      console.log(`savedAlbumQueue savedTrackArtistCount and offset: ${offset}, savedTrackArtistCount: ${savedTrackArtistCount}`);
    }

    console.log('savedAlbumQueue starting secondary queues');
    await spotifyAlbumArtistQueue.add({ userId });
    await lastAlbumQueue.add();
    await audioDbAlbumQueue.add();
  });

  // *** SPOTIFY QUEUE ***
  // gets information for albums and artists from spotify
  spotifyAlbumArtistQueue.process(maxJobsPerWorker, async (job) => {
    const { userId } = job.data;
    console.log('spotifyAlbumArtistQueue starting with userId: ', userId);
    await spotifyData.addAlbumSpotifyIds(userId, sleep);
    await  spotifyData.addArtistSpotifyIds(userId, sleep);
    await spotifyData.addArtistImageUrls(userId, sleep);
  });

  // *** LAST.FM QUEUE ***
  // gets information for albums from Last.fm
  lastAlbumQueue.process(maxJobsPerWorker, async (job) => {
    console.log('lastAlbumQueue starting');
    await lastFmData.addAlbumLastFmData(sleep);
    await lastFmData.addArtistLastFmData(sleep);
    // some day we might get genres from last.fm again ???
    // await lastFmData.getLastFmGenres(sleep);
  });

  // *** AUDIO DB QUEUE ***
  // gets information for albums from theAudioDb.com
  audioDbAlbumQueue.process(maxJobsPerWorker, async (job) => {
    console.log('audioDbAlbumQueue starting');
    await theAudioDbData.addAlbumTheAudioDbData(sleep);
    await theAudioDbData.addArtistTheAudioDbData(sleep);
  });
};

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
