import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticationState } from '../store/selectors';
import httpService from '../util/httpUtils';
import { connect } from 'react-redux';

const TestModal = ({ greeting, isAuthenticated, open }) => {
  console.log('test modal: ', greeting);
  return (
    <div>
      <h1>{!isAuthenticated ? greeting : 'Not Open'}</h1>
      <h2>{greeting}</h2>
      {open && <div>Hi</div>}
    </div>
  );
};

TestModal.propTypes = {
  greeting: PropTypes.string.isRequired,
  open: PropTypes.bool,
  isAuthenticated: PropTypes.bool.isRequired
};

TestModal.defaultProps = {
  open: false,
};

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps, props) => ({
  ...props,
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

//export default connect(mapStateToProps)(TestModal);
export default connect(mapStateToProps, null, mergeProps)(TestModal);

//export default TestModal;
