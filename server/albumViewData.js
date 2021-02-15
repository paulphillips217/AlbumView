const genre = require('./data/genre');
const artist = require('./data/artist');
const album = require('./data/album');
const user = require('./data/user');

const Queue = require('bull');
const albumViewQueue = new Queue('albumView', process.env.REDIS_URL);

// this gets them from the database and sends them to the client
const getGenreList = async (req, res) => {
  const genreList = await genre.getGenres(req.user.userId);
  res.json(genreList);
};

const getAlbumGenreList = async (req, res) => {
  const albumGenreList = await album.getAlbumGenres();
  res.json(albumGenreList);
};

const integrateUserOwnedAlbums = async (req, res) => {
  const { userId } = req.user;
  const { albums } = req.body;
  const { genreId } = req.params;

  //console.log('integrateUserOwnedAlbums', albums);
  if (albums && albums.length > 0) {
    for (let i = 0; i < albums.length; i++) {
      // console.log('integrateUserOwnedAlbums inserting:', albums[i]);
      const artistId = await artist.insertSingleArtist({
        name: albums[i].artistName,
      });

      // associate artist with user
      await user.insertSingleUserArtist({
        userId,
        artistId,
      });
      // console.log('insertSingleUserArtist returned: ', artistResult);

      // console.log('integrateUserOwnedAlbums artistId: ', artistId);
      const albumId = await album.insertSingleAlbum({
        artistId: artistId,
        name: albums[i].albumName,
      });
      // console.log('integrateUserOwnedAlbums albumId: ', albumId);

      // associate album with user
      await user.insertSingleUserAlbum({
        userId,
        albumId,
        localId: albums[i].localId,
        oneDriveId: albums[i].oneDriveId,
      });
      // console.log('insertSingleUserAlbum returned: ', albumResult);
    }
  }

  // kick off worker job to keep database updated
  const queueCount = await albumViewQueue.count();
  if (queueCount > 0) {
    console.log(`worker queue count is ${queueCount}, not queuing another task`);
  } else {
    const job = await albumViewQueue.add({
      userId: userId,
      savedAlbumCount: 0,
    });
    console.log('integrateUserOwnedAlbums created albumViewQueue worker job', job.id);
  }

  const userAlbums = await user.getUserAlbums(userId, genreId);
  res.json(userAlbums);
};

// this gets them from the database and sends them to the client
const fetchSavedAlbums = async (req, res) => {
  const userAlbums = await user.getUserAlbums(
    req.user.userId,
    req.params.genreId
  );
  console.log(
    'fetchSavedAlbums - genre & count:',
    req.params.genreId,
    userAlbums.length
  );

  // return album data to client
  res.json(userAlbums);
};

const getJobProgress = async (req, res) => {
  const jobId = req.params.id;
  console.log('getJobProgress', jobId);

  const job = await albumViewQueue.getJob(jobId);

  if (job === null) {
    console.log('getJobProgress job not found');
    res.json({ notFound: true });
  } else {
    const state = await job.getState();
    const progress = job._progress;
    const failedReason = job.failedReason;
    res.json({ jobId, state, progress, failedReason });
  }
}

module.exports = {
  getGenreList,
  getAlbumGenreList,
  integrateUserOwnedAlbums,
  fetchSavedAlbums,
  getJobProgress,
};
