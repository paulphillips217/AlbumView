// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

// for testing: to log out use      localStorage.setItem('accessToken', '');

import React, { Component } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';
import './styles/App.css';
import './styles/splitPane.css';
import './styles/flex-height.css';
import { setAccessToken, setRefreshToken } from './store/actions';
import { getAuthenticationState, getContextType } from './store/selectors';
import ContextList from './components/ContextList';
import ContextGrid from './components/ContextGrid';
import AlbumViewHeader from './components/AlbumViewHeader';
import { ContextType } from './store/types';
import PropTypes from 'prop-types';
import RelatedArtistList from './components/RelatedArtistList';

class App extends Component {
  componentDidMount() {
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

    const ThreePanelDisplay = () => (
      <SplitPane
        split="vertical"
        minSize={50}
        defaultSize={350}
        style={{ height: '50%', position: 'relative' }}
        paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
      >
        <ContextList httpService={this.props.httpService} />
        <SplitPane
          split="vertical"
          minSize={50}
          defaultSize={350}
          style={{ position: 'relative' }}
          paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
        >
          <RelatedArtistList httpService={this.props.httpService} />
          <ContextGrid httpService={this.props.httpService} />
        </SplitPane>
      </SplitPane>
    );

    const TwoPanelDisplay = () => (
      <SplitPane
        split="vertical"
        minSize={50}
        defaultSize={350}
        style={{ height: '50%', position: 'relative' }}
        paneStyle={{ 'overflow-y': 'auto', 'overflow-x': 'hidden' }}
      >
        <ContextList httpService={this.props.httpService} />
        <ContextGrid httpService={this.props.httpService} />
      </SplitPane>
    );

    const SinglePanelDisplay = () => (
      <ContextGrid httpService={this.props.httpService} />
    );

    if (isAuthenticated) {
      console.log('we are authenticated');
      return (
        <div className="box">
          <div className="row header">
            <AlbumViewHeader httpService={this.props.httpService} />
          </div>
          <div className="row content">
            {(contextType === ContextType.Artists ||
              contextType === ContextType.Playlists) && <TwoPanelDisplay />}
            {(contextType === ContextType.Albums ||
              contextType === ContextType.Tracks) && <SinglePanelDisplay />}
            {contextType === ContextType.RelatedArtists && (
              <ThreePanelDisplay />
            )}
          </div>
          <div className="row footer"> </div>
        </div>
      );
    } else {
      console.log('we are NOT authenticated');
      return loginComponent;
    }
  }
}

App.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  contextType: PropTypes.string.isRequired,
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  contextType: getContextType(state),
});

const mapDispatchToProps = (dispatch) => ({
  setAccessToken: (accessToken) => dispatch(setAccessToken(accessToken)),
  setRefreshToken: (refreshToken) => dispatch(setRefreshToken(refreshToken)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
