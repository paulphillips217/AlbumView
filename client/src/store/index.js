// react redux tutorial: https://react-redux.js.org/introduction/basic-tutorial
// https://redux.js.org/basics/example

import {combineReducers, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension";
import {authenticationReducer} from "./reducers";

const rootReducer = combineReducers({
  authentication: authenticationReducer
});

export const configureStore = () => {
  return createStore(
    rootReducer,
    composeWithDevTools()
  );
};

export default configureStore();
