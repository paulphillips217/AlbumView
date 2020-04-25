// this comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node
// Spotify api reference: https://developer.spotify.com/documentation/web-api/reference/

import React, { Component } from "react";
import "./styles/App.css";
import { connect } from "react-redux";
import { setAuthenticated } from "./store/actions";

class App extends Component {
  componentDidMount() {
    console.log('client application initial render');
    const urlParams = new URLSearchParams(window.location.search);
    const isUserAuthorized = urlParams.has("authorized") ? true : false;

    if (isUserAuthorized) {
      this.props.setAuthenticated();
      this.props.history.push("/playlists");
    }
  }

  render() {
    return (
      <div className="App">
        <header className="header">
          <h1>Spotify Listening History</h1>
          <p>View your music history with Spotify</p>
          <a href={`${process.env.REACT_APP_SERVER_ROOT}/login`}>
            Connect your Spotify account
          </a>
        </header>
      </div>
    );
  }
}

export default connect(null, { setAuthenticated })(App);
