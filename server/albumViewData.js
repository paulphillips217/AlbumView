const axios = require('axios');
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

// this gets them from the database and sends them to the client
const fetchSavedArtists = async (req, res) => {
  const userArtists = await user.getUserArtists(req.user.userId);
  console.log('fetchSavedArtists count:', userArtists.length);
  res.json(userArtists);
};

const getWikiArtistArticle = async (req, res) => {
  const method = req.method;
  const artistSpotifyId = req.params.id;

  const artistRecord = await artist.getArtistBySpotifyId(artistSpotifyId);
  if (!artistRecord) {
    console.log('getWikiArtistArticle - getArtistBySpotifyId got no records');
    res.json({ emptyResponse: true });
  }
  const artistName = encodeURIComponent(artistRecord.name);
  // const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${artistName}&prop=text&format=json`
  const url = `https://www.theaudiodb.com/api/v1/json/1/search.php?s=${artistName}`
  console.log('getWikiArtistArticle - url: ', url);

  try {
    const response = await axios({
      url: url,
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('getWikiArtistArticle - axios got response for ', url);
    if (response && response.data) {
      // console.log('getWikiArtistArticle - response ', response.data);
      res.json(response.data);
    } else {
      console.log('getWikiArtistArticle - axios got empty response');
      res.json({ emptyResponse: true });
    }
  } catch (err) {
    console.error('getWikiArtistArticle error', err.name, err.message);
    res.json({ emptyResponse: true });
  }
}

module.exports = {
  getGenreList,
  getAlbumGenreList,
  integrateUserOwnedAlbums,
  fetchSavedAlbums,
  getJobProgress,
  fetchSavedArtists,
  getWikiArtistArticle,
};
