import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import { getLocalFileData, getSavedAlbumData } from '../store/selectors';
import { setDataLoading, setLocalFileData } from '../store/actions';
import FileAnalysis from './FileAnalysis';
import LocalFolderPicker from './LocalFolderPicker';
import HttpService from '../util/httpUtils';
import { createLocalTracks, tearDownLocalTracks } from '../util/localFileUtils';

const LocalFileContext = ({
  savedAlbumData,
  localFileData,
  setLoading,
  setFileData,
  httpService,
}) => {
  const theme = useTheme();

  setLoading(false);

  const readAlbumArray = (fileData) => {
    const theAlbumArray = [];
    Object.keys(fileData).forEach((key, index) => {
      const item = fileData[key];
      if (!item.type.includes('audio')) {
        return;
      }
      const splitPath = item.webkitRelativePath.split('/');
      const artistName = splitPath.length >= 3 ? splitPath[splitPath.length - 3] : 'invalid';
      const albumName =
        splitPath.length >= 3 ? splitPath[splitPath.length - 2] : 'invalid';
      const fileIndex = theAlbumArray.findIndex(
        (a) => a.artistName && a.artistName === artistName && a.albumName && a.albumName === albumName
      );
      if (fileIndex >= 0) {
        theAlbumArray[fileIndex].tracks.push(item);
      } else {
        theAlbumArray.push({
          artistName,
          albumName,
          localId: index + 1,
          tracks: [item],
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

  console.log('localFileData in LocalFileContext is: ', localFileData);

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        <FileAnalysis
          albumFileIdProp="localId"
          savedAlbumData={savedAlbumData.data}
          folderPicker={LocalFolderPicker}
          localFileData={localFileData}
          readAlbumArray={readAlbumArray}
          createTracks={createLocalTracks}
          tearDownTracks={tearDownLocalTracks}
          setLocalFileData={setFileData}
          httpService={httpService}
        />
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

LocalFileContext.propTypes = {
  savedAlbumData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.number,
        spotifyAlbumId: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
        albumName: PropTypes.string,
        artistName: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.number,
      })
    ),
  }).isRequired,
  localFileData: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      webkitRelativePath: PropTypes.string,
    })
  ).isRequired,
  setLoading: PropTypes.func.isRequired,
  setFileData: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
  localFileData: getLocalFileData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
  setFileData: (data) => dispatch(setLocalFileData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LocalFileContext);
