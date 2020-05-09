// react-router tutorial: https://codeburst.io/getting-started-with-react-router-5c978f70df91

import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {
  Route,
  BrowserRouter as Router,
  Switch,
  NavLink,
} from 'react-router-dom';
import TrackHistory from './components/History';
import { Provider } from 'react-redux';
import store from './store';
import { Icon, Menu } from 'semantic-ui-react';
import Tester from './components/Tester';

const routing = (
  <Provider store={store}>
    <React.StrictMode>
      <div>
        <Router>
          <Menu
            icon="labeled"
            borderless
            widths={3}
            style={{
              flexShrink: 0, //don't allow flexbox to shrink it
              borderRadius: 0, //clear semantic-ui style
              margin: 0, //clear semantic-ui style
            }}
          >
            <Menu.Item as={NavLink} to="/home" active={false}>
              <Icon name="home" />
              Home
            </Menu.Item>
            <Menu.Item as={NavLink} to="/history">
              <Icon name="list layout" />
              History
            </Menu.Item>
            <Menu.Item as={NavLink} to="/tester">
              <Icon name="browser" />
              Tester
            </Menu.Item>
          </Menu>
          <Switch>
            <Route path="/history" component={TrackHistory} />
            <Route path="/tester" component={Tester} />
            <Route path="/home" component={App} />
            <Route component={App} />
          </Switch>
        </Router>
      </div>
    </React.StrictMode>
  </Provider>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
