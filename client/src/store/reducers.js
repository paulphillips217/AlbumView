import {
  ContextType,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  CONTEXT_TYPE,
  CONTEXT_ITEM,
  CONTEXT_GRID_DATA,
  CONTEXT_GRID_TYPE,
  CONTEXT_GRID_OFFSET
} from './types';

const initialState = {
  authenticated: !!localStorage.getItem('accessToken'),
  accessToken: localStorage.getItem('accessToken') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  contextType: ContextType.Albums,
  contextItem: '',
  contextGridData: [],
  contextGridType: ContextType.Tracks,
  contextGridOffset: 0,
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
    case CONTEXT_GRID_DATA:
      console.log('setting context grid data');
      return Object.assign({}, state, {
        contextGridData: action.payload,
      });
    case CONTEXT_GRID_TYPE:
      console.log('setting context grid type');
      return Object.assign({}, state, {
        contextGridType: action.payload,
      });
    case CONTEXT_GRID_OFFSET:
      console.log('setting context grid offset');
      return Object.assign({}, state, {
        contextGridOffset: action.payload,
      });
    default:
      return state;
  }
}
