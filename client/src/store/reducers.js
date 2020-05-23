import {
  ContextType,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
} from './types';

const initialState = {
  authenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  contextType: ContextType.Albums,
  contextItem: '',
};

export function albumViewReducer(state = initialState, action) {
  switch (action.type) {
    case ACCESS_TOKEN:
      console.log('setting access token');
      localStorage.setItem('accessToken', action.payload);
      return Object.assign({}, state, {
        accessToken: action.payload,
        authenticated: !!action.payload,
      });
    case REFRESH_TOKEN:
      console.log('setting refresh token');
      localStorage.setItem('refreshToken', action.payload);
      return Object.assign({}, state, {
        refreshToken: action.payload,
      });
    case CONTEXT_TYPE:
      console.log('setting context type');
      return Object.assign({}, state, {
        contextType: action.payload,
      });
    case CONTEXT_ITEM:
      console.log('setting context item');
      return Object.assign({}, state, {
        contextItem: action.payload,
      });
    default:
      return state;
  }
}
