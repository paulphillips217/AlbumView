// this comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node

import React, { Component } from 'react';
import { connect } from "react-redux";
import '../styles/App.css';

class TrackHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      musicHistory: []
    };
  }

  componentDidMount() {
    const isUserAuthorized = this.props.authentication.authenticated;
    console.log('history - authorized: ' + isUserAuthorized);

    if (isUserAuthorized) {
      console.log('getting data');
      fetch('/history')
        .then(res => res.json())
        .then(data => {
          console.log('data: ' + JSON.stringify(data));
          this.setState({
            musicHistory: data,
          });
        })
        .catch(error => console.log(error));
    }
    else {
      this.props.history.push('/');
    }
  }

  render() {
    const { musicHistory } = this.state;

//  <td>{format(item.played_at, 'D MMM YYYY, hh:mma')}</td>

    const TableItem = (item, index) => (
      <tr key={item.played_at}>
        <td>{index + 1}</td>
        <td>{item.track_name}</td>
        <td>{item.played_at}</td>
      </tr>
    );

    const RecentlyPlayed = () => (
      <div className="recently-played">
        <h2>Recent Tracks</h2>
        <table className="table">
          <thead>
          <tr>
            <th>#</th>
            <th>Song title</th>
            <th>Time</th>
          </tr>
          </thead>
          <tbody>{musicHistory.map((e, index) => TableItem(e, index))}</tbody>
        </table>
      </div>
    );

    return (
      <div className="App">
        <header className="header">
          <h1>Spotify Listening History</h1>
          {musicHistory.length !== 0 ? <RecentlyPlayed /> : null}
        </header>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  authentication: state.authentication
});

export default connect(
  mapStateToProps
)(TrackHistory);
