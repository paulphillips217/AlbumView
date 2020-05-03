import React, { Component } from "react";
import { connect } from "react-redux";
import "../styles/App.css";
import { List, Image } from "semantic-ui-react";
import { getImage } from "../util/utilities";
import {
  getAuthenticationState,
  getSelectedPlaylist,
} from "../store/selectors";
import { setAuthenticated, setSelectedPlaylist } from "../store/actions";

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
    console.log("playlist componentDidMount");
    const { pageOffset, pageLimit } = this.state;
    this.getPlaylists(pageOffset, pageLimit);

    // connect up the scrolling mechanism
    const node = document.querySelector(".Pane1");
//    console.log(node);
    node.addEventListener("scroll", (e) => {
      this.handleScroll(e);
    });
  }

  getPlaylists = (pageOffset, pageLimit) => {
    const { isAuthenticated } = this.props;
    const { playlistData } = this.state;

    if (isAuthenticated) {
      fetch(`/playlists/${pageOffset}/${pageLimit}`)
        .then((res) => res.json())
        .then((rawData) => {
          //          console.log(rawData);
          const data = rawData.items.map((e) => ({
            id: e.id,
            name: e.name,
            author: e.owner.display_name,
            description: e.description,
            image: getImage(e.images),
          }));
          const newData = playlistData.concat(data);
          this.setState({
            playlistData: newData,
            moreDataAvailable: rawData.next != null,
          });
        })
        .catch((error) => console.log(error));
    }
  };

  handleScroll = (e) => {
    const bigGrid = document.querySelector(".left-align-list");
    console.log("scrolling: " + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector(".Pane1");
      const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
      const pageScrollOffset = node.scrollTop + node.offsetHeight;
      console.log("scrolling -- " + lastGridOffset + ", " + pageScrollOffset);
      if (pageScrollOffset >= lastGridOffset) {
        const { playlistData, pageLimit } = this.state;
        const newPageOffset = playlistData.length;
        this.setState({
          pageOffset: newPageOffset,
        });
        this.getPlaylists(newPageOffset, pageLimit);
      }
    }
  };

  handleClick = (id) => {
    this.props.selectPlaylist(id);
  };

  createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  render() {
    const { playlistData } = this.state;

    const PlaylistItem = (item, index) => (
      <List.Item key={index}>
        <Image src={item.image} size="mini" />
        <List.Content>
          <List.Header>
            <button className='link-button' onClick={(e) => this.handleClick(item.id, e)}>
              {item.name}
            </button>
          </List.Header>
          <List.Description>
            <div>
              by: {item.author} <br />
              <div
                dangerouslySetInnerHTML={this.createDescriptionMarkup(
                  item.description
                )}
              />
            </div>
          </List.Description>
        </List.Content>
      </List.Item>
    );

    const PlaylistTable = () => (
      <List floated={"left"} divided relaxed>
        {playlistData.map((item, index) => PlaylistItem(item, index))}
      </List>
    );

    return (
      <div className="App1">
        <h1>Your Spotify Playlists</h1>
        <div className="left-align-list">
          {playlistData.length !== 0 ? <PlaylistTable /> : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  selectedPlaylist: getSelectedPlaylist(state),
});

const mapDispatchToProps = (dispatch) => ({
  logIn: () => dispatch(setAuthenticated()),
  selectPlaylist: (playlistId) => dispatch(setSelectedPlaylist(playlistId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Playlists);
