// this originally comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

import React, { Component } from "react";
import { connect } from "react-redux";
import SplitPane from "react-split-pane";

import "./styles/App.css";
import "./styles/splitPane.css";
import { setAuthenticated } from "./store/actions";
import Playlists from "./components/playlists";
import PlaylistTracks from "./components/playlistTracks";
import { getAuthenticationState, getSelectedPlaylist } from "./store/selectors";

class App extends Component {
  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const isUserAuthorized = urlParams.has("authorized") ? true : false;

    if (isUserAuthorized) {
      this.props.logIn();
      this.props.history.push("/");
    }
  }

  render() {
    const { isAuthenticated } = this.props;
    const loginComponent = (
      <div className="App">
        <h1>Album View</h1>
        <p>View your Spotify music collection</p>
        <a href={`${process.env.REACT_APP_SERVER_ROOT}/login`}>
          Connect to your Spotify account
        </a>
      </div>
    );

// split-pane height is 100% minus height of the menu (72.6px)
    if (isAuthenticated) {
      return (
        <div className="App">
          <SplitPane
            split="vertical"
            minSize={50}
            defaultSize={400}
            style={{ height: "calc(100vh - 72.6px)" }}
            paneStyle={{ overflow: "auto" }}
          >
            <Playlists />
            <PlaylistTracks />
          </SplitPane>
        </div>
      );
    } else {
      return loginComponent;
    }
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  selectedPlaylist: getSelectedPlaylist(state),
});

const mapDispatchToProps = (dispatch) => ({
  logIn: () => dispatch(setAuthenticated()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
