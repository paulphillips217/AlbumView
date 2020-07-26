import React, { useEffect, useState } from 'react';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import { Button, Header, List } from 'semantic-ui-react';

const OneDriveFolderPicker = ({ setFileData, httpService }) => {
  const theme = useTheme();
  const [folders, setFolders] = useState([]);
  const [musicFolder, setMusicFolder] = useState('root');

  const handleClickDone = () => {
    console.log('handleClickDone', musicFolder);
    setFileData(musicFolder);
  };

  const handleClickFolder = (id) => {
    console.log('handleClickFolder', id);
    setMusicFolder(id);
    httpService
      .get(`/one-drive/folders/${id}`)
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
  };

  useEffect(() => handleClickFolder('root'), []);

  const FolderSubList = ({ rootId }) => (
    <List.List>
      {folders &&
        folders.length > 0 &&
        folders
          .filter((f) => f.parentId === rootId)
          .map((folder) => (
            <List.Item key={folder.id}>
              <List.Icon
                name={folder.file ? 'file' : 'folder'}
                style={{
                  cursor: 'pointer',
                  color: folder.id === musicFolder ? 'red' : theme.color,
                }}
                onClick={() => handleClickFolder(folder.id)}
              />
              <List.Content>
                <List.Header style={theme}>{folder.name}</List.Header>
                <FolderSubList rootId={folder.id} />
              </List.Content>
            </List.Item>
          ))}
    </List.List>
  );

  return (
    <div style={{ ...theme, paddingLeft: '80px', paddingTop: '80px' }}>
      <Header as="h3" style={{ ...theme }}>
        Select the directory that contains your album collection
        <Button style={{ marginLeft: '80px' }} onClick={handleClickDone}>
          Pick the red one
        </Button>
      </Header>
      <List>
        <List.Item>
          <List.Icon
            name="folder"
            style={{
              cursor: 'pointer',
              color: 'root' === musicFolder ? 'red' : theme.color,
            }}
            onClick={() => handleClickFolder('root')}
          />
          <List.Content>
            <List.Header style={theme}>Root</List.Header>
            <FolderSubList rootId="root" />
          </List.Content>
        </List.Item>
      </List>
    </div>
  );
};

OneDriveFolderPicker.propTypes = {
  setFileData: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

export default OneDriveFolderPicker;
