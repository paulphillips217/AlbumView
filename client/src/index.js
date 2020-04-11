// react-router tutorial: https://codeburst.io/getting-started-with-react-router-5c978f70df91

import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Route, BrowserRouter as Router, Switch, NavLink } from 'react-router-dom'
import Playlists from "./components/playlists";
import PlaylistTracks from "./components/playlistTracks";
import TrackHistory from "./components/history";
import { Provider } from 'react-redux'
import store from './store'
import { Menu, Icon } from 'semantic-ui-react';


const routing = (
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <Menu
          icon="labeled"
          borderless
          widths={3}
          style={{
            flexShrink: 0, //don't allow flexbox to shrink it
            borderRadius: 0, //clear semantic-ui style
            margin: 0 //clear semantic-ui style
          }}>
          <Menu.Item as={NavLink} to="/home" >
            <Icon name="list layout"/>
            Home
          </Menu.Item>
          <Menu.Item as={NavLink} to="/history">
            <Icon name="cogs"/>
            History
          </Menu.Item>
          <Menu.Item as={NavLink} to="/playlists">
            <Icon name="browser"/>
            Playlists
          </Menu.Item>
        </Menu>
        <Switch>
          <Route path="/history" component={TrackHistory} />
          <Route path="/playlists" component={Playlists} />
          <Route path="/playlist-tracks/:id" component={PlaylistTracks} />
          <Route path="/home" component={App} />
          <Route component={App} />
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
