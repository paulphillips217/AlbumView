import React from 'react';
import '../styles/App.css';

const OneDriveLogin = () => (
  <div className="App">
    <a
      className={'one-drive-button'}
      href={`${process.env.REACT_APP_SERVER_ROOT}/one-drive/signin`}
    >
      Connect to OneDrive
    </a>
  </div>
);

export default OneDriveLogin
