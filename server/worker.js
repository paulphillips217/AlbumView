if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './server/variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log('worker environment', result.parsed);
}

// notes on spotify rate limiting:
// from website https://developer.spotify.com/documentation/web-api/
// Note: If Web API returns status code 429, it means that you have sent too many requests.
// When this happens, check the Retry-After header, where you will see a number displayed.
// This is the number of seconds that you need to wait, before you try your request again.

let throng = require('throng');
let Queue = require('bull');

const album = require('./data/album');
const artist = require('./data/artist');
const spotifyData = require('./spotifyData');
const lastFmData = require('./lastFmData');

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = +process.env.WEB_CONCURRENCY || 1;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = +process.env.MAX_JOBS_PER_WORKER || 50;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const start = async () => {
  // Connect to the named work queues
  let testQueue = new Queue('test', process.env.REDIS_URL);
  let savedAlbumQueue = new Queue('savedAlbums', process.env.REDIS_URL);
  let lastAlbumQueue = new Queue('lastAlbums', process.env.REDIS_URL);

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
    return { value: "This will be stored" };
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
      job.progress(offset);
      offset += +process.env.SPOTIFY_PAGE_LIMIT;
      console.log(
        `savedAlbumQueue count and offset: ${offset}, count: ${count}`
      );
    }

    job.progress(count);
    console.log('savedAlbumQueue processing completed');

    await lastAlbumQueue.add();
    console.log('savedAlbumQueue started last album queue');
  });

  // gets information for albums from Last.fm
  lastAlbumQueue.process(maxJobsPerWorker, async (job) => {
    console.log('lastAlbumQueue starting');
    const albums = await album.getAlbumsWithNoMbid();
    console.log('lastAlbumQueue album count', albums.count);

    if (albums) {
      for (let i = 0; i < albums.length; i++) {
        await sleep(process.env.LAST_FM_INTERVAL);
        let musicBrainzId = await lastFmData.getMusicBrainzId(albums[i].artistName, albums[i].albumName);
        console.log('lastAlbumQueue musicBrainzId', musicBrainzId);
        if (!musicBrainzId) {
          musicBrainzId = 'NOT-FOUND';
        }
        await album.addMusicBrainzId(albums[i].albumId, musicBrainzId);
      }
    }
  });
};

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
