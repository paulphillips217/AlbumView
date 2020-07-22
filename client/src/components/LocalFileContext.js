import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { getSavedAlbumData } from '../store/selectors';
import { setDataLoading } from '../store/actions';
import FileAnalysis from './FileAnalysis';
import LocalFolderPicker from './LocalFolderPicker';

const LocalFileContext = ({ savedAlbumData, setDataLoading, httpService }) => {
  const theme = useTheme();
  /*
// this was me connecting to last.fm to get album data -- testing
  useEffect(() => {
    const getLastFmData = () => {
      httpService
        .get(`/last-album`)
        .then((rawData) => {
          console.log('Last.fm data', rawData);
        })
        .catch((error) => console.log(error));
    };
    getLastFmData();
  }, []);
*/
  setDataLoading(false);

  const readAlbumArray = (fileData) => {
    const theAlbumArray = [];
    Object.keys(fileData).forEach((key, index) => {
      const item = fileData[key];
      if (!item.type.includes('audio')) {
        return;
      }
      const splitPath = item.webkitRelativePath.split('/');
      const artist =
        splitPath.length >= 3 ? splitPath[splitPath.length - 3] : 'invalid';
      const albumName =
        splitPath.length >= 3 ? splitPath[splitPath.length - 2] : 'invalid';
      const fileIndex = theAlbumArray.findIndex(
        (a) =>
          a.artist &&
          a.artist === artist &&
          a.albumName &&
          a.albumName === albumName
      );
      if (fileIndex >= 0) {
        theAlbumArray[fileIndex].tracks.push(key);
      } else {
        theAlbumArray.push({
          artist: artist,
          albumName: albumName,
          index: index + 1,
          tracks: [key],
        });
      }
    });
    console.log('read local albums: ', theAlbumArray);
    return theAlbumArray;
  };

  const contextData = {
    name: 'Local File Analysis',
    description: '',
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        <FileAnalysis
          savedAlbumData={savedAlbumData}
          folderPicker={LocalFolderPicker}
          readAlbumArray={readAlbumArray}
          httpService={httpService}
        />
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

LocalFileContext.propTypes = {
  savedAlbumData: PropTypes.object.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LocalFileContext);