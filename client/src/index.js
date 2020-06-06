// react-router tutorial: https://codeburst.io/getting-started-with-react-router-5c978f70df91

import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import TrackHistory from './components/History';
import { Provider } from 'react-redux';
import store from './store';
import Auth from './components/Auth';
import httpService from './util/httpUtils';

const commService = new httpService(store);

const routing = (
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <Switch>
          <Route
            path="/history"
            render={(props) => (
              <TrackHistory {...props} httpService={commService} />
            )}
          />
          <Route
            path="/home"
            render={(props) => <App {...props} httpService={commService} />}
          />
          <Route path="/auth" component={Auth} />
          <Route
            render={(props) => <App {...props} httpService={commService} />}
          />
        </Switch>
      </Router>
    </React.StrictMode>
  </Provider>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
