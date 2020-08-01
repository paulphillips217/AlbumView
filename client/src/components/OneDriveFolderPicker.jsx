import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';
import { Button, Header, List } from 'semantic-ui-react';
import HttpService from '../util/httpUtils';

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
      .get(`/one-drive/children/${id}`)
      .then((folderList) => {
        const updatedList = [...folders];
        folderList.forEach((folder) => {
          if (!updatedList.some((f) => f.id === folder.id)) {
            updatedList.push({ ...folder, parentId: id });
          }
        });
        setFolders(updatedList);
        console.log('handleClickFolder', folderList);
      })
      .catch((error) => console.log(error));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  FolderSubList.propTypes = {
    rootId: PropTypes.string.isRequired,
  };

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
              color: musicFolder === 'root' ? 'red' : theme.color,
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
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

export default OneDriveFolderPicker;
