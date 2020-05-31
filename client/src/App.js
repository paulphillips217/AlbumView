// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

// testing: to log out use      localStorage.setItem('accessToken', '');

import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import './styles/App.css';
import './styles/splitPane.css';
import { setAccessToken, setRefreshToken } from './store/actions';
import { getAuthenticationState, getContextType } from './store/selectors';
import ContextList from './components/ContextList';
import ContextGrid from './components/ContextGrid';
import AlbumViewHeader from './components/AlbumViewHeader';
import { ContextType } from './store/types';

class App extends Component {
  componentDidMount() {
    console.log('app is mounting, context: ', this.context);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('refresh_token')) {
      this.props.setRefreshToken(urlParams.get('refresh_token'));
      console.log(`refresh token: ${urlParams.get('refresh_token')}`);
    }
    if (urlParams.has('access_token')) {
      this.props.setAccessToken(urlParams.get('access_token'));
      console.log(`access token: ${urlParams.get('access_token')}`);
      this.props.history.push('/home');
    }
  }

  render() {
    const { isAuthenticated, contextType } = this.props;
    const loginComponent = (
      <div className="App">
        <h1>Album View</h1>
        <p>View your Spotify music collection</p>
        <a
          className={'spotify-button'}
          href={`${process.env.REACT_APP_SERVER_ROOT}/login`}
        >
          Connect to Spotify
        </a>
      </div>
    );

    const TwoPanelDisplay = () => (
      <SplitPane
        split="vertical"
        minSize={50}
        defaultSize={350}
        style={{ height: 'calc(100vh - 80px)' }}
        paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
      >
        <ContextList />
        <ContextGrid />
      </SplitPane>
    );

    const SinglePanelDisplay = () => (
      <div className={'single-panel-display'}>
        <ContextGrid />
      </div>
    );

    // split-pane height is 100% minus height of the menu (72.6px)
    if (isAuthenticated) {
      return (
        <div className="App">
          <AlbumViewHeader />
          {(contextType === ContextType.Artists ||
            contextType === ContextType.Playlists) && <TwoPanelDisplay />}
          {contextType !== ContextType.Artists &&
            contextType !== ContextType.Playlists && <SinglePanelDisplay />}
        </div>
      );
    } else {
      return loginComponent;
    }
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  contextType: getContextType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
