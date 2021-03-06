import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import { getOneDriveLoggedIn, getOneDriveRoot, getSavedAlbumData } from '../store/selectors';
import { setDataLoading, setOneDriveRoot } from '../store/actions';
import OneDriveLogin from './OneDriveLogin';
import OneDriveFolderPicker from './OneDriveFolderPicker';
import FileAnalysis from './FileAnalysis';
import HttpService from '../util/httpUtils';
import { createOneDriveTracks, tearDownOneDriveTracks } from '../util/localFileUtils';

const OneDriveFileContext = ({
  isOneDriveLoggedIn,
  savedAlbumData,
  localFileData,
  setLoading,
  setFileData,
  httpService,
}) => {
  const theme = useTheme();

  setLoading(false);

  const contextData = {
    name: 'OneDrive File Analysis',
    description: '',
  };

  const readAlbumArray = async (musicRootFolderId) => {
    console.log('OneDrive readAlbumArray', musicRootFolderId);
    const theAlbumArray = [];

    try {
      const artistList = await httpService.get(
        `/one-drive/children/${musicRootFolderId}`
      );
      console.log('artist list: ', artistList);

      for (const artist of artistList) {
        if (artist.folder) {
          const albumList = await httpService.get(`/one-drive/children/${artist.id}`);
          console.log('album list: ', albumList);
          albumList.forEach((album) =>
            theAlbumArray.push({
              oneDriveId: album.id,
              artistName: artist.name,
              albumName: album.name,
              tracks: [],
            })
          );
        }
      }
    } catch (error) {
      console.log(error);
    }

    console.log('OneDrive readAlbumArray - theAlbumArray: ', theAlbumArray);
    return theAlbumArray;
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        {isOneDriveLoggedIn && (
          <FileAnalysis
            albumFileIdProp='oneDriveId'
            savedAlbumData={savedAlbumData.data}
            folderPicker={OneDriveFolderPicker}
            localFileData={localFileData}
            readAlbumArray={readAlbumArray}
            createTracks={createOneDriveTracks}
            tearDownTracks={tearDownOneDriveTracks}
            setLocalFileData={setFileData}
            httpService={httpService}
          />
        )}
        {!isOneDriveLoggedIn && <OneDriveLogin />}
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

OneDriveFileContext.propTypes = {
  isOneDriveLoggedIn: PropTypes.bool.isRequired,
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
  localFileData: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
  setFileData: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isOneDriveLoggedIn: getOneDriveLoggedIn(state),
  savedAlbumData: getSavedAlbumData(state),
  localFileData: getOneDriveRoot(state),
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
  setFileData: (data) => dispatch(setOneDriveRoot(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OneDriveFileContext);
