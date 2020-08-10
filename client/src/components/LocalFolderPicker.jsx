import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';

const LocalFolderPicker = ({ setLocalFileData }) => {
  const theme = useTheme();

  const onFileChange = (e) => {
    console.log('file data', e.target.files);
    setLocalFileData(e.target.files);
  };

  return (
    <>
      <Header as="h3" style={{ ...theme, paddingTop: '50px' }}>
        Select the directory that contains your album collection
      </Header>
      <input
        type="file"
        webkitdirectory=""
        mozdirectory=""
        directory=""
        style={{ ...theme, minHeight: '70px' }}
        onChange={onFileChange}
      />
    </>
  );
};

LocalFolderPicker.propTypes = {
  setLocalFileData: PropTypes.func.isRequired,
};

export default LocalFolderPicker;
