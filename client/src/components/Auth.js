import React, { useEffect } from 'react';
import { setAccessToken, setRefreshToken } from '../store/actions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Auth = ({ setRefreshToken, setAccessToken, history }) => {
  const logMeOut = () => {
    setRefreshToken('');
    setAccessToken('');
    history.push('/');
  };

  useEffect(logMeOut, []);

  return <div className="App">Hi there</div>;
};

Auth.propTypes = {
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
});

export default connect(null, mapDispatchToProps)(Auth);
