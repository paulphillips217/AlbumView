import React, { useState } from 'react';
import { Button, Dimmer, Grid, Header, Loader } from 'semantic-ui-react';
import '../styles/App.css';
import { useTheme } from 'emotion-theming';

const LocalFiles = () => {
  const theme = useTheme();
  const [fileData, setFileData] = useState({});
  const [albums, setAlbums] = useState([]);
  const [dimmerActive, setDimmerActive] = useState(false);

  const onFileChange = (e) => {
    setFileData(e.target.files);
  };

  const handleRead = () => {
    const theAlbumArray = [];
    if (fileData && fileData.length > 0) {
      Object.keys(fileData).forEach((key, index) => {
        const item = fileData[key];
        const splitPath = item.webkitRelativePath.split('/');
        const artistName =
          splitPath.length >= 3 ? splitPath[splitPath.length - 3] : 'invalid';
        const albumName =
          splitPath.length >= 3 ? splitPath[splitPath.length - 2] : 'invalid';
        if (
          item.type.includes('audio') &&
          !theAlbumArray.some(
            (a) =>
              a.artistName &&
              a.artistName === artistName &&
              a.albumName &&
              a.albumName === albumName
          )
        ) {
          theAlbumArray.push({
            artistName: artistName,
            albumName: albumName,
            index,
          });
        }
      });
      console.log('albums: ', theAlbumArray);
      setAlbums(theAlbumArray);
    } else {
      console.log('file import data is empty');
    }
  };

  const handleAnalyze = () => {};

  const GridItem = (item, index) => (
    <Grid.Row columns={2} key={index} style={theme}>
      <Grid.Column>{item.artistName}</Grid.Column>
      <Grid.Column>{item.albumName}</Grid.Column>
    </Grid.Row>
  );

  return (
    <div style={{ ...theme, paddingLeft: '20px' }}>
      <Dimmer active={dimmerActive}>
        <Loader />
      </Dimmer>
      <Header as="h3" style={{ ...theme, paddingTop: '50px' }}>
        Please select the directory that contains your album collection
      </Header>
      <input
        type="file"
        webkitdirectory=""
        mozdirectory=""
        directory=""
        style={{ ...theme, minHeight: '70px' }}
        onChange={onFileChange}
      />
      {fileData && fileData.length > 0 && !albums.length && (
        <Button onClick={handleRead}>Read Files</Button>
      )}
      {albums.length > 0 && <Button onClick={handleAnalyze}>Analyze Files</Button>}
      <Grid style={{ width: '100%' }}>
        {albums.map((item, index) => GridItem(item, index))}
      </Grid>
    </div>
  );
};

export default LocalFiles;
