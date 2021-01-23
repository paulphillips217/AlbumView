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
const maxJobsPerWorker = +process.env.MAX_JOBS_PER_WORKER || 1;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const start = async () => {
  // Connect to the named work queues
  const albumViewQueue = new Queue('albumView', process.env.REDIS_URL);
  console.log('starting worker process');

  albumViewQueue.process(maxJobsPerWorker, async (job) => {
    const { userId, savedAlbumCount } = job.data;
    console.log(
      `albumViewQueue processing a job from the queue, user: ${userId}, savedAlbumCount: ${savedAlbumCount}`
    );

    let offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < savedAlbumCount) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getSavedAlbums(userId, offset);
      job.progress(savedAlbumCount > 0 ? Math.floor((100 * offset) / savedAlbumCount) : 100);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      // console.log(`albumViewQueue savedAlbumCount and offset: ${offset}, savedAlbumCount: ${savedAlbumCount}`);
    }

    job.progress(100);
    console.log('albumViewQueue processing completed');

    // now let's do followed artists (don't track progress here)
    await sleep(process.env.SPOTIFY_INTERVAL);
    const followedArtistCount = await spotifyData.getFollowedArtists(userId, 0);
    offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < followedArtistCount) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getFollowedArtists(userId, offset);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      console.log(`albumViewQueue followedArtistCount and offset: ${offset}, followedArtistCount: ${followedArtistCount}`);
    }

    // and now artists from saved tracks (again, don't track progress here)
    await sleep(process.env.SPOTIFY_INTERVAL);
    const savedTrackArtistCount = await spotifyData.getSavedTrackArtists(userId, 0);
    offset = +process.env.SPOTIFY_PAGE_LIMIT;
    while (offset < savedTrackArtistCount) {
      await sleep(process.env.SPOTIFY_INTERVAL);
      await spotifyData.getSavedTrackArtists(userId, offset);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      console.log(`albumViewQueue savedTrackArtistCount and offset: ${offset}, savedTrackArtistCount: ${savedTrackArtistCount}`);
    }

    console.log('albumViewQueue starting secondary functions');
    try {
      console.log('Spotify updates starting for userId ', userId);
      await spotifyData.addAlbumSpotifyIds(userId, sleep);
      await  spotifyData.addArtistSpotifyIds(userId, sleep);
      await spotifyData.addArtistImageUrls(userId, sleep);
      console.log('lastAlbum updates starting');
      await lastFmData.addAlbumLastFmData(sleep);
      await lastFmData.addArtistLastFmData(sleep);
      // some day we might get genres from last.fm again ???
      // await lastFmData.getLastFmGenres(sleep);
      console.log('audioDbAlbum updates starting');
      await theAudioDbData.addAlbumTheAudioDbData(sleep);
      await theAudioDbData.addArtistTheAudioDbData(sleep);
    } catch (err) {
      console.log('error starting secondary jobs: ', err.name, err.message);
    }
  });
};

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
