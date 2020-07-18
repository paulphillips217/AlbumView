import React, { Fragment, useState } from 'react';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import { getSavedAlbumData } from '../store/selectors';
import { connect } from 'react-redux';
import { Button, Grid, Header, List } from 'semantic-ui-react';

const OneDriveFiles = ({ savedAlbumData, httpService }) => {
  const theme = useTheme();
  const [folders, setFolders] = useState([]);

  const handleClickFolder = (id) => {
    console.log('handleTestOneDrive');
    httpService
      .get(`/one-drive/${id}`)
      .then((folderList) => {
        folderList.forEach((folder) => (folder.parentId = id));
        console.log('one drive rawData', folderList);
        setFolders([...folders, ...folderList]);
      })
      .catch((error) => console.log(error));
  };

  const FolderSubList = ({ rootId }) => (
    <List.List>
      {folders &&
        folders.length > 0 &&
        folders
          .filter((f) => f.parentId === rootId)
          .map((folder) => (
            <List.Item>
              <List.Icon
                name="folder"
                style={{ cursor: 'pointer' }}
                onClick={() => handleClickFolder(folder.id)}
              />
              <List.Content>
                <List.Header>{folder.name}</List.Header>
                <FolderSubList rootId={folder.id} />
              </List.Content>
            </List.Item>
          ))}
    </List.List>
  );

  return (
    <div style={{ ...theme, paddingLeft: '80px', paddingTop: '80px' }}>
      <List>
        <List.Item>
          <List.Icon
            name="folder"
            style={{ cursor: 'pointer' }}
            onClick={() => handleClickFolder('root')}
          />
          <List.Content>
            <List.Header>Root</List.Header>
            <FolderSubList rootId="root" />
          </List.Content>
        </List.Item>
      </List>
    </div>
  );
};

OneDriveFiles.propTypes = {
  savedAlbumData: PropTypes.array.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
});

export default connect(mapStateToProps)(OneDriveFiles);
