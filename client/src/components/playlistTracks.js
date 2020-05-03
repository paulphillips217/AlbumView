import React, { Component } from "react";
import { connect } from "react-redux";
import "../styles/App.css";
import { Grid, Image, Accordion } from "semantic-ui-react";
import { getImage } from "../util/utilities";
import {
  getAuthenticationState,
  getSelectedPlaylist,
} from "../store/selectors";
import { setAuthenticated } from "../store/actions";

class PlaylistTracks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistData: {
        id: "",
        name: "",
        description: "",
      },
      trackData: [],
      pageOffset: 0,
      pageLimit: 50,
      moreDataAvailable: true,
      activeIndex: -1,
    };
  }

  getPlaylistData = () => {
    const { isAuthenticated, selectedPlaylist } = this.props;
    console.log("getPlaylistData: " + selectedPlaylist);

    if (isAuthenticated && selectedPlaylist) {
      fetch(`/playlist/${selectedPlaylist}`)
        .then((res) => res.json())
        .then((data) => {
          this.setState({
            playlistData: {
              id: data.id,
              name: data.name,
              description: data.description,
            },
          });
        })
        .catch((error) => console.log(error));
    }
  };

  getPlaylistTracks = (pageOffset, pageLimit) => {
    const { trackData } = this.state;
    const { isAuthenticated, selectedPlaylist } = this.props;
    console.log("getPlaylistTracks: " + selectedPlaylist + ", " + pageOffset);

    if (isAuthenticated && selectedPlaylist) {
      fetch(
        `http://localhost:5000/playlist-tracks/${selectedPlaylist}/${pageOffset}/${pageLimit}`
      )
        .then((res) => res.json())
        .then((rawData) => {
          const data = rawData.items.map((e) => ({
            id: e.track.id,
            name: e.track.name,
            album: e.track.album.name,
            artist: e.track.album.artists[0].name,
            image: getImage(e.track.album.images),
            href: e.track.href,
            uri: e.track.uri,
          }));
          const newData = pageOffset ? trackData.concat(data) : data;
          this.setState({
            trackData: newData,
            moreDataAvailable: rawData.next != null,
          });
        })
        .catch((error) => console.log(error));
    } else {
      this.props.history.push("/");
    }
  };

  componentDidMount() {
    console.log("playlistTracks did mount");
    const { isAuthenticated, selectedPlaylist } = this.props;

    // connect up the scrolling mechanism
    const node = document.querySelector(".Pane2");
    console.log(node);
    node.addEventListener("scroll", (e) => {
      this.handleScroll(e);
    });

    if (isAuthenticated && selectedPlaylist) {
      const { pageOffset, pageLimit } = this.state;
      this.getPlaylistData();
      this.getPlaylistTracks(pageOffset, pageLimit);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedPlaylist !== prevProps.selectedPlaylist) {
      console.log("time to update the playlist tracks");

      const { isAuthenticated, selectedPlaylist } = this.props;

      if (isAuthenticated && selectedPlaylist) {
        const { pageOffset, pageLimit } = this.state;
        this.getPlaylistData();
        this.getPlaylistTracks(pageOffset, pageLimit);
      }
    }
  }

  handleScroll = (e) => {
    const bigGrid = document.querySelector(".column:last-child");
    console.log("scrolling: " + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector(".Pane2");
      const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
      //      const pageScrollOffset = window.pageYOffset + window.innerHeight;
      const pageScrollOffset = node.scrollTop + node.offsetHeight;
      console.log("scrolling -- " + lastGridOffset + ", " + pageScrollOffset);
      if (pageScrollOffset >= lastGridOffset) {
        const { trackData, pageLimit } = this.state;
        const newPageOffset = trackData.length;
        this.setState({
          pageOffset: newPageOffset,
        });
        this.getPlaylistTracks(newPageOffset, pageLimit);
      }
    }
  };

  handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  handleQueueClick = (uri) => {
    console.log("handleQueueClick: " + encodeURI(uri));
    fetch(`http://localhost:5000/queue-track/${encodeURI(uri)}`, {
      method: "post",
    })
      .then((res) => res)
      .then((rawData) => {
        //        console.log('play click data: ');
        //        console.log(rawData);
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { playlistData, trackData, activeIndex } = this.state;

    const GridItem = (item, index) => (
      <Grid.Column key={index}>
        <Accordion>
          <Accordion.Title
            active={activeIndex === index}
            index={index}
            onClick={this.handleAccordionClick}
          >
            <Image src={item.image} />
            <p>{item.name}</p>
          </Accordion.Title>
          <Accordion.Content active={activeIndex === index}>
            <p className={"album-details"}>
              <strong>Track</strong>: {item.name}
              <br />
              <strong>Artist</strong>: {item.artist}
              <br />
              <strong>Album</strong>: {item.album}
              <br />
              <strong>Info</strong>: <a href={item.href}>click here</a>
              <br />
              <strong>Play</strong>:{" "}
              <a href={"http://open.spotify.com/track/" + item.id}>
                click here
              </a>
              <button
                value={item.uri}
                onClick={() => this.handleQueueClick(item.uri)}
              >
                Queue Track
              </button>
            </p>
          </Accordion.Content>
        </Accordion>
      </Grid.Column>
    );

    const AlbumGrid = () => (
      <Grid columns={6} style={{ width: "100%" }}>
        {trackData.map((e, index) => GridItem(e, index))}
      </Grid>
    );

    return (
      <div className="App">
        <h1>{playlistData.name}</h1>
        <h3>{playlistData.description}</h3>
        {trackData.length !== 0 ? <AlbumGrid /> : ""}
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
});

export default connect(mapStateToProps, mapDispatchToProps)(PlaylistTracks);
