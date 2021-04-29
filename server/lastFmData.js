const axios = require('axios');
const moment = require('moment');
const album = require('./data/album');
const artist = require('./data/artist');
const genre = require('./data/genre');
const utilities = require('./utilities');

const talkToLastFm = async (req, res) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const artist = encodeURIComponent(req.params.artist);
  const album = encodeURIComponent(req.params.album);
  const url = `http://ws.audioscrobbler.com/2.0?method=album.getinfo&api_key=${apiKey}&artist=${artist}&album=${album}&format=json`;

  axios({
    url: url,
    method: req.method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      // console.log('axios got response for ', url);
      if (response && response.data) {
        //console.log('last.fm response', response.data);
        res.json(response.data);
      } else {
        console.log('axios got empty response');
        res.json({ emptyResponse: true });
      }
    })
    .catch((err) => {
      console.error('caught error in talkToLastFm: ', JSON.stringify(err));
      res.json({ empty: true });
    });
};

const chatWithLastFm = async (url, method) => {
  try {
    const response = await axios({
      url: url,
      method: method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    // console.log('axios got response for ', url);
    if (response && response.data) {
      return response.data;
    } else {
      console.log('axios got empty response');
      return { emptyResponse: true };
    }
  } catch (err) {
    console.error('chatWithLastFm error', err);
    return { emptyResponse: true };
  }
};

const getMusicBrainzId = async (artist, album) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&format=json&autocorrect=1`;
  //console.log('getMusicBrainzId url', url);
  const response = await chatWithLastFm(url, 'GET');
  //console.log('getMusicBrainzId response', response);
  if (response && response.album) {
    return response.album.mbid;
  }
  if (response.error) {
    console.error('getMusicBrainzId error: ', response.message);
  }
  return 'NOT-FOUND';
};

const getArtistInfo = async (artist) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0?method=artist.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&format=json&autocorrect=1`;
  // console.log('getArtistInfo url', url);
  const response = await chatWithLastFm(url, 'GET');
  // console.log('getArtistInfo response', response);
  if (response && response.artist) {
    return response.artist;
  }
  if (response.error) {
    console.error('getArtistInfo error: ', response.message);
  }
  return {};
};

const getAlbumInfo = async (artist, album) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&format=json&autocorrect=1`;
  console.log('getAlbumInfo url', url);
  const response = await chatWithLastFm(url, 'GET');
  //console.log('getAlbumInfo response', response);
  if (response && response.album) {
    return response.album;
  }
  if (response.error) {
    console.error('getAlbumInfo error: ', response.message);
  }
  return {};
};

const getAlbumGenres = async (musicBrainzId, artist, album) => {
  const apiKey = process.env.LAST_FM_API_KEY;
  let url = `http://ws.audioscrobbler.com/2.0?method=album.gettoptags&api_key=${apiKey}&format=json&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(album)}&autocorrect=1`;
  if (musicBrainzId && musicBrainzId !== '' && musicBrainzId !== 'NOT-FOUND') {
    url += `&mbid=${musicBrainzId}`;
  }
  console.log('getAlbumGenres url', url);
  const response = await chatWithLastFm(url, 'GET');
  //console.log('getAlbumGenres response', response);
  if (response && response.toptags) {
    return response.toptags.tag;
  }
  console.log('getAlbumGenres error response', response);
  return [];
};

const addAlbumLastFmData = async (sleep) => {
  const albums = await album.getAlbumsWithNoMbid();
  console.log('addAlbumLastFmData album count', albums.length);

  if (albums) {
    for (let i = 0; i < albums.length; i++) {
      await sleep(process.env.LAST_FM_INTERVAL);

      let albumInfo = await getAlbumInfo(
        albums[i].artistName,
        albums[i].albumName
      );

      // if we didn't get a result, try removing everything between parentheses
      if (
        (!albumInfo || !albumInfo.idAlbum) &&
        (albums[i].albumName.includes('&') ||
          albums[i].albumName.includes('(') ||
          albums[i].albumName.includes('/'))
      ) {
        const albumName = albums[i].albumName
          .replace(/\(.+\)/g, '')
          .replace(/&/g, 'and')
          .replace(/ \/ /g, '/')
          .trim();
        console.log(
          `trying to search for ${albumName} instead of ${albums[i].albumName}`
        );
        await sleep(process.env.LAST_FM_INTERVAL);
        albumInfo = await getAlbumInfo(
          albums[i].artistName,
          albumName
        );
      }

      // console.log('addAlbumLastFmData album info', albumInfo);
      await album.addMusicBrainzId(
        albums[i].albumId,
        albumInfo.mbid ? albumInfo.mbid : 'NOT-FOUND'
      );

      const albumRecord = await album.getAlbumById(albums[i].albumId);
      // console.log('addAlbumLastFmData album record: ', albumRecord);

      // only do this if the image url is empty and spotifyId is empty too
      // (otherwise we can get imageUrl from spotify)
      if (albumRecord && !albumRecord.imageUrl &&
        (!albumRecord.spotifyId || albumRecord.spotifyId === 'NOT-FOUND')) {
        // console.log('addAlbumLastFmData image object: ', albumInfo.image);
        const imageUrl = utilities.getLastFmImage(albumInfo.image);
        if (imageUrl) {
          console.log('addAlbumLastFmData adding image url: ', albums[i].albumId, imageUrl);
          await album.updateAlbum(albums[i].albumId, {
            imageUrl: imageUrl,
          });
        }
      }
      if (albumRecord && !albumRecord.releaseDate &&
        (!albumRecord.spotifyId || albumRecord.spotifyId === 'NOT-FOUND') &&
        albumInfo && albumInfo.wiki && albumInfo.wiki.published) {
        console.log(
          'addAlbumLastFmData release date: ',
          albumInfo.wiki.published
        );
        await album.updateAlbum(albums[i].albumId, {
          releaseDate: moment(albumInfo.wiki.published),
        });
      }
    }
  }
};

const addArtistLastFmData = async (sleep) => {
  const artists = await artist.getArtistsWithNoMbId();
  console.log('addArtistLastFmData artist count', artists.length);

  if (artists && artists.length > 0) {
    for (let i = 0; i < artists.length; i++) {
      await sleep(process.env.LAST_FM_INTERVAL);

      // console.log('addArtistLastFmData artists record: ', artists[i]);
      // console.log('addArtistLastFmData searching for artist: ', artists[i],artistId, artists[i].artistName);
      const artistInfo = await getArtistInfo(
        artists[i].artistName
      );
      console.log('addArtistLastFmData mbid: ', artistInfo.mbid);

      await artist.updateArtist(artists[i].artistId, {
        musicBrainzId:
          artistInfo && artistInfo.mbid ? artistInfo.mbid : 'NOT-FOUND',
      });

      const artistRecord = await artist.getArtistById(artists[i].artistId);
      // console.log('addArtistLastFmData artist record: ', artistRecord);

      // only do this if the image url is empty and spotifyId is empty too
      // (otherwise we can get imageUrl from spotify)
      if (
        artistRecord &&
        (!artistRecord.spotifyId || artistRecord.spotifyId === 'NOT-FOUND') &&
        !artistRecord.imageUrl &&
        artistInfo &&
        artistInfo.image
      ) {
        // console.log('addArtistLastFmData image object: ', artistInfo.image);
        const imageUrl = utilities.getLastFmImage(artistInfo.image);
        if (imageUrl) {
          console.log('addArtistLastFmData updating imageUrl: ', imageUrl);
          await artist.updateArtist(artists[i].artistId, {
            imageUrl: imageUrl,
          });
        }
      }
    }
  }
};

const getLastFmGenres = async (sleep) => {
  const genrelessAlbums = await album.getAlbumsWithNoGenres();
  console.log('getLastFmGenres album count', genrelessAlbums.length);
  if (genrelessAlbums) {
    for (let i = 0; i < genrelessAlbums.length; i++) {
      // for now, skip albums whose musicBrainzId is NOT-FOUND
      if (genrelessAlbums[i].musicBrainzId === 'NOT-FOUND') {
        continue;
      }
      await sleep(process.env.LAST_FM_INTERVAL);
      let genres = await getAlbumGenres(
        genrelessAlbums[i].musicBrainzId,
        genrelessAlbums[i].artistName,
        genrelessAlbums[i].albumName
      );

      if (genres) {
        for (let j = 0; j < genres.length; j++) {
          console.log('getLastFmGenres album genre', genres[j]);
          const { count, name } = genres[j];
          if (count >= 10) {
            const genreRecord = await genre.insertGenre(name);
            const albumGenre = await album.insertAlbumGenre(
              genrelessAlbums[i].albumId,
              genreRecord.id
            );
            console.log(
              'getLastFmGenres albumGenreRecord',
              genrelessAlbums[i].albumId,
              genreRecord.id
            );
          }
        }
      }
    }
  }
};

module.exports = {
  talkToLastFm,
  getMusicBrainzId,
  getArtistInfo,
  getAlbumInfo,
  getAlbumGenres,
  addAlbumLastFmData,
  addArtistLastFmData,
  getLastFmGenres,
};
