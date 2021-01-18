const axios = require('axios');
const album = require('./data/album');
const artist = require('./data/artist');
const genre = require('./data/genre');

const talkToTheAudioDb = async (req, res) => {
  const apiKey = process.env.THE_AUDIO_DB_API_KEY;
  const artist = encodeURIComponent(req.params.artist);
  const album = encodeURIComponent(req.params.album);
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/searchalbum.php?s=${artist}&a=${album}`;

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
      console.error('caught error in talkToLastFm: ', err.name, err.message);
      res.json({ empty: true });
    });
};

const chatWithTheAudioDb = async (url, method) => {
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
    console.error('chatWithTheAudioDb error', err.name, err.message);
    return { emptyResponse: true };
  }
};

const getAlbumData = async (artist, album) => {
  const apiKey = process.env.THE_AUDIO_DB_API_KEY;
  const encodedArtist = encodeURIComponent(artist);
  const encodedAlbum = encodeURIComponent(album);
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/searchalbum.php?s=${encodedArtist}&a=${encodedAlbum}`;
  console.log('getAlbumData url', url);
  const response = await chatWithTheAudioDb(url, 'GET');
  //console.log('getAlbumData response', response);
  if (response && response.album) {
    return response.album[0];
  }
  if (response.error) {
    console.error('getAlbumData error: ', response.message);
  }
  return 'NOT-FOUND';
};

const getArtistData = async (artist) => {
  const apiKey = process.env.THE_AUDIO_DB_API_KEY;
  const encodedArtist = encodeURIComponent(artist);
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/search.php?s=${encodedArtist}`;
  console.log('getArtistData url', url);
  const response = await chatWithTheAudioDb(url, 'GET');
  // console.log('getArtistData response', response);
  if (response && response.artists) {
    return response.artists[0];
  }
  if (response.error) {
    console.error('getAlbumData error: ', response.message);
  }
  return 'NOT-FOUND';
};

const addAlbumTheAudioDbData = async (sleep) => {
  const albums = await album.getAlbumsWithNoTadbId();
  console.log('addAlbumTheAudioDbData album count', albums.length);

  if (albums) {
    let tadbId;
    for (let i = 0; i < albums.length; i++) {
      await sleep(process.env.THE_AUDIO_DB_INTERVAL);
      let albumData = await getAlbumData(
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
          .replace(/ \/ /g, '/')
          .trim();
        console.log(
          `trying to search for ${albumName} instead of ${albums[i].albumName}`
        );
        await sleep(process.env.THE_AUDIO_DB_INTERVAL);
        albumData = await getAlbumData(
          albums[i].artistName,
          albumName
        );
      }
      // console.log('addAlbumTheAudioDbData albumData', albumData);
      if (albumData && albumData.idAlbum) {
        tadbId = albumData.idAlbum;
      } else {
        tadbId = 'NOT-FOUND';
      }
      await album.addTadbId(albums[i].albumId, tadbId);

      // add genres for albums we found
      if (albumData) {
        if (albumData.strStyle) {
          const genreRecord = await genre.insertGenre(albumData.strStyle);
          if (genreRecord && genreRecord.id) {
            await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
            // console.log('addAlbumTheAudioDbData strStyle albumGenreRecord', genre, albums[i].albumId, genreRecord.id);
          } else {
            // console.log('addAlbumTheAudioDbData no albumData.strStyle', albums[i].albumId, albumData.strStyle);
          }
        }
        if (albumData.strGenre) {
          const genreRecord = await genre.insertGenre(albumData.strGenre);
          if (genreRecord && genreRecord.id) {
            await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
            // console.log('addAlbumTheAudioDbData strGenre albumGenreRecord',albums[i].albumId,genreRecord.id);
          } else {
            // console.log('addAlbumTheAudioDbData no albumData.strGenre',albums[i].albumId,albumData.strGenre);
          }
        }
        if (albumData.strMood) {
          const genreRecord = await genre.insertGenre(albumData.strMood);
          if (genreRecord && genreRecord.id) {
            await album.insertAlbumGenre(albums[i].albumId, genreRecord.id);
            // console.log('addAlbumTheAudioDbData strMood albumGenreRecord', albums[i].albumId, genreRecord.id);
          } else {
            // console.log('addAlbumTheAudioDbData no albumData.strMood', albums[i].albumId, albumData.strMood);
          }
        }
      }
    }
  }
};

const addArtistTheAudioDbData = async (sleep) => {
  const artists = await artist.getArtistsWithNoTadbId();
  console.log('addArtistTheAudioDbData artist count', artists.length);

  if (artists && artists.length > 0) {
    for (let i = 0; i < artists.length; i++) {
      await sleep(process.env.SPOTIFY_INTERVAL);

      // console.log('addArtistTheAudioDbData artists record: ', artists[i]);
      // console.log('addArtistTheAudioDbData searching for artist: ', artists[i],artistId, artists[i].artistName);
      const artistInfo = await getArtistData(
        artists[i].artistName
      );
      // console.log('addArtistTheAudioDbData artistInfo: ', artistInfo);

      await artist.updateArtist(artists[i].artistId, {
        tadbId:
          artistInfo && artistInfo.idArtist ? artistInfo.idArtist : 'NOT-FOUND',
      });

      const artistRecord = await artist.getArtistById(artists[i].artistId);
      // console.log('addArtistTheAudioDbData artist record: ', artistRecord);

      // only do this if the image url is empty and spotifyId is empty too
      // (otherwise we can get imageUrl from spotify)
      if (
        artistRecord &&
        (!artistRecord.spotifyId || artistRecord.spotifyId === 'NOT-FOUND') &&
        !artistRecord.imageUrl &&
        artistInfo &&
        artistInfo.strArtistThumb
      ) {
        // console.log('addArtistTheAudioDbData image object: ', artistInfo.strArtistThumb);
        await artist.updateArtist(artists[i].artistId, {
          imageUrl: artistInfo.strArtistThumb,
        });
      }
    }
  }
};

module.exports = {
  talkToTheAudioDb,
  getAlbumData,
  getArtistData,
  addAlbumTheAudioDbData,
  addArtistTheAudioDbData,
};
