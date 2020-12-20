const genre = require('./data/genre');
const artist = require('./data/artist');
const album = require('./data/album');
const user = require('./data/user');

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
      // console.log('integrateUserOwnedAlbums artistId: ', artistId);
      const albumId = await album.insertSingleAlbum({
        artistId: artistId,
        name: albums[i].albumName,
      });
      // console.log('integrateUserOwnedAlbums albumId: ', albumId);

      // associate album with user
      const result = await user.insertSingleUserAlbum({
        userId,
        albumId: albumId,
        localId: albums[i].localId,
        oneDriveId: albums[i].oneDriveId,
      });
      // console.log('insertSingleUserAlbum returned: ', result);
    }
  }

  const userAlbums = await user.getUserAlbums(userId, genreId);
  res.json(userAlbums);
};

module.exports = {
  getGenreList,
  getAlbumGenreList,
  integrateUserOwnedAlbums,
};
