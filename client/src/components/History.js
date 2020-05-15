// this comes from the tutorial at https://pusher.com/tutorials/spotify-history-react-node

import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { getAuthenticationState } from '../store/selectors';
import httpService from '../util/httpUtils';
import TestModal from './TestModal';

class TrackHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      musicHistory: [],
    };
  }

  componentDidMount() {
    const { isAuthenticated } = this.props;

    if (isAuthenticated) {
      this.props.httpService
        .get('/history')
        .then((data) => {
          this.setState({
            musicHistory: data || [],
          });
        })
        .catch((error) => console.error(error));
    } else {
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
          <TestModal greeting='Hello Paul' open={true} />
          {musicHistory && musicHistory.length > 0 ? <RecentlyPlayed /> : null}
        </header>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(TrackHistory);
