import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import { getOneDriveLoggedIn, getSavedAlbumData } from '../store/selectors';
import { setDataLoading } from '../store/actions';
import OneDriveLogin from './OneDriveLogin';
import OneDriveFolderPicker from './OneDriveFolderPicker';
import FileAnalysis from './FileAnalysis';
import { trimTrackFileName } from '../util/utilities';
import HttpService from '../util/httpUtils';

const OneDriveFileContext = ({
  isOneDriveLoggedIn,
  savedAlbumData,
  setLoading,
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
              artist: artist.name,
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

  const createTracks = async (album) => {
    const trackList = await httpService.get(`/one-drive/children/${album.oneDriveId}`);
    console.log('createTracks', trackList);
    return trackList
      .filter((t) => t.file.mimeType.includes('audio'))
      .map((t) => ({
        name: t.audio && t.audio.title ? t.audio.title : trimTrackFileName(t.name),
        url: t['@microsoft.graph.downloadUrl'],
      }));
  };

  const tearDownTracks = () => {
    console.log('tearDownTracks');
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
            readAlbumArray={readAlbumArray}
            createTracks={createTracks}
            tearDownTracks={tearDownTracks}
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
    offset: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        albumId: PropTypes.string,
        albumName: PropTypes.string,
        artist: PropTypes.string,
        image: PropTypes.string,
        releaseDate: PropTypes.string,
        localId: PropTypes.number,
        oneDriveId: PropTypes.string,
      })
    ),
  }).isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  isOneDriveLoggedIn: getOneDriveLoggedIn(state),
  savedAlbumData: getSavedAlbumData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OneDriveFileContext);
