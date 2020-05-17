import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { List, Image, Dropdown } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import {
  getAuthenticationState,
  getSelectedPlaylist,
} from '../store/selectors';
import { setSelectedPlaylist } from '../store/actions';
import httpService from '../util/httpUtils';

class Playlists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistData: [],
      pageOffset: 0,
      pageLimit: 50,
      moreDataAvailable: true,
    };
  }

  componentDidMount() {
    console.log('playlist componentDidMount');
    const { pageOffset, pageLimit } = this.state;
    this.getPlaylists(pageOffset, pageLimit);

    // connect up the scrolling mechanism
    const node = document.querySelector('.Pane1');
    if (node) {
      node.addEventListener('scroll', (e) => {
        this.handleScroll(e);
      });
    }
  }

  getPlaylists = (pageOffset, pageLimit) => {
    const { isAuthenticated } = this.props;
    const { playlistData } = this.state;

    if (isAuthenticated) {
      this.props.httpService
        .get(`/playlist-list/${pageOffset}/${pageLimit}`)
        .then((data) => {
          const parsedData = data.items.map((e) => ({
            id: e.id,
            name: e.name,
            author: e.owner.display_name,
            description: e.description,
            image: getImage(e.images),
          }));
          const newData = playlistData.concat(parsedData);
          this.setState({
            playlistData: newData,
            moreDataAvailable: data.next != null,
          });
        })
        .catch((error) => console.log(error));
    }
  };

  handleScroll = (e) => {
    const bigGrid = document.querySelector('.left-align-list');
    //    console.log("scrolling: " + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector('.Pane1');
      if (node) {
        const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
        const pageScrollOffset = node.scrollTop + node.offsetHeight;
        //      console.log("scrolling -- " + lastGridOffset + ", " + pageScrollOffset);
        if (pageScrollOffset >= lastGridOffset) {
          const { playlistData, pageLimit } = this.state;
          const newPageOffset = playlistData.length;
          this.setState({
            pageOffset: newPageOffset,
          });
          this.getPlaylists(newPageOffset, pageLimit);
        }
      }
    }
  };

  handleClick = (id) => {
    this.props.selectPlaylist(id);
  };

  render() {
    const { playlistData } = this.state;

    const PlaylistItem = (item, index) => (
      <List.Item key={index}>
        <Image src={item.image} size="mini" />
        <List.Content>
          <List.Header>
            <button
              className="link-button"
              onClick={(e) => this.handleClick(item.id, e)}
            >
              {item.name}
            </button>
          </List.Header>
          <List.Description>
            <div>
              by: {item.author} <br />
            </div>
          </List.Description>
        </List.Content>
      </List.Item>
    );

    const PlaylistTable = () => (
      <List floated={'left'} divided relaxed>
        {playlistData.map((item, index) => PlaylistItem(item, index))}
      </List>
    );

    const listOptions = [
      {
        key: 'playlists',
        text: 'Your Spotify Playlists',
        value: 'playlists',
      },
      {
        key: 'favorite-artists',
        text: 'Your Favorite Artists',
        value: 'favorite-artists',
      },
    ];

    return (
      <div className="App1">
        <h1>
          <Dropdown
            inline
            options={listOptions}
            defaultValue={listOptions[0].value}
          />
        </h1>
        <div className="left-align-list">
          {playlistData && playlistData.length > 0 ? <PlaylistTable /> : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  selectedPlaylist: getSelectedPlaylist(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mapDispatchToProps = (dispatch) => ({
  selectPlaylist: (playlistId) => dispatch(setSelectedPlaylist(playlistId)),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Playlists);
