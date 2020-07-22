import React, { Fragment } from 'react';
import { Header } from 'semantic-ui-react';
import { useTheme } from 'emotion-theming';
import PropTypes from 'prop-types';

const LocalFolderPicker = ({setFileData}) => {
  const theme = useTheme();

  const onFileChange = (e) => {
    console.log('file data', e.target.files);
    setFileData(e.target.files);
  };

  return (
    <Fragment>
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
    </Fragment>
  )
}

LocalFolderPicker.propTypes = {
  setFileData: PropTypes.func.isRequired,
};

export default LocalFolderPicker;
