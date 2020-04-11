import { AUTHENTICATED } from './types'

const initialState = {
  authenticated: false
};

export function authenticationReducer(
  state = initialState,
  action) {
  switch (action.type) {
    case AUTHENTICATED:
      console.log('setting authenticated');
      return Object.assign({}, state, {
        authenticated: true
      });
    default:
      return state;
  }
}
