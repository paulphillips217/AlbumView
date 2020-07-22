import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { getOneDriveLoggedIn, getSavedAlbumData } from '../store/selectors';
import { setDataLoading } from '../store/actions';
import OneDriveLogin from './OneDriveLogin';
import OneDriveFolderPicker from './OneDriveFolderPicker';
import FileAnalysis from './FileAnalysis';

const OneDriveFileContext = ({
  isOneDriveLoggedIn,
  savedAlbumData,
  setDataLoading,
  httpService,
}) => {
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

  const contextData = {
    name: 'OneDrive File Analysis',
    description: '',
  };

  const readAlbumArray = (fileData) => {
    /*
    const id = fileData;
    httpService
      .get(`/one-drive/${id}/children`)
      .then((folderList) => {
        const updatedList = [...folders];
        folderList.forEach((folder) => {
          if (!updatedList.some((f) => f.id === folder.id)) {
            folder.parentId = id;
            updatedList.push(folder);
          }
        });
        setFolders(updatedList);
        console.log('handleClickFolder', folderList);
      })
      .catch((error) => console.log(error));
*/
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        {isOneDriveLoggedIn && (
          <FileAnalysis
            savedAlbumData={savedAlbumData}
            folderPicker={OneDriveFolderPicker}
            readAlbumArray={readAlbumArray}
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
  savedAlbumData: PropTypes.object.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  isOneDriveLoggedIn: getOneDriveLoggedIn(state),
  savedAlbumData: getSavedAlbumData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OneDriveFileContext);