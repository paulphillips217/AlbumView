import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid, Image, Accordion } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import {
  getAuthenticationState,
  getSelectedPlaylist,
} from '../store/selectors';
import ModalAlbum from './modalAlbum';
import httpService from '../util/httpUtils';

class PlaylistTracks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlistData: {
        id: '',
        name: '',
        description: '',
      },
      listTrackData: [],
      pageOffset: 0,
      pageLimit: 50,
      moreDataAvailable: true,
      activeIndex: -1,
      modalId: '',
      albumData: {},
    };
  }

  getPlaylistData = () => {
    const { isAuthenticated, selectedPlaylist } = this.props;
    console.log('getPlaylistData: ' + selectedPlaylist);

    if (isAuthenticated && selectedPlaylist) {
      this.props.httpService
        .get(`/playlist/${selectedPlaylist}`)
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
    const { listTrackData } = this.state;
    const { isAuthenticated, selectedPlaylist } = this.props;
    console.log('getPlaylistTracks: ' + selectedPlaylist + ', ' + pageOffset);

    if (isAuthenticated && selectedPlaylist) {
      this.props.httpService
        .get(`/playlist-tracks/${selectedPlaylist}/${pageOffset}/${pageLimit}`)
        .then((rawData) => {
          const data = rawData.items.map((e) => ({
            id: e.track.id,
            name: e.track.name,
            albumId: e.track.album.id,
            albumName: e.track.album.name,
            artist: e.track.album.artists[0].name,
            image: getImage(e.track.album.images),
            href: e.track.href,
            uri: e.track.uri,
          }));
          const newData = pageOffset ? listTrackData.concat(data) : data;
          this.setState({
            listTrackData: newData,
            moreDataAvailable: rawData.next != null,
          });
        })
        .catch((error) => console.log(error));
    } else {
      this.props.history.push('/');
    }
  };

  componentDidMount() {
    console.log('playlistTracks did mount');
    const { isAuthenticated, selectedPlaylist } = this.props;

    // connect up the scrolling mechanism
    const node = document.querySelector('.Pane2');
    if (node) {
      node.addEventListener('scroll', (e) => {
        this.handleScroll(e);
      });
    }

    if (isAuthenticated && selectedPlaylist) {
      const { pageOffset, pageLimit } = this.state;
      this.getPlaylistData();
      this.getPlaylistTracks(pageOffset, pageLimit);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedPlaylist !== prevProps.selectedPlaylist) {
      console.log('time to update the playlist tracks');

      this.setState({
        listTrackData: [],
        pageOffset: 0,
        pageLimit: 50,
        moreDataAvailable: true,
        activeIndex: -1,
        modalId: '',
        albumData: {},
      });

      const { isAuthenticated, selectedPlaylist } = this.props;
      if (isAuthenticated && selectedPlaylist) {
        const { pageOffset, pageLimit } = this.state;
        this.getPlaylistData();
        this.getPlaylistTracks(pageOffset, pageLimit);
      }
    }
  }

  handleScroll = (e) => {
    const bigGrid = document.querySelector('.column:last-child');
//    console.log('scrolling: ' + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector('.Pane2');
      const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
      //      const pageScrollOffset = window.pageYOffset + window.innerHeight;
      const pageScrollOffset = node.scrollTop + node.offsetHeight;
//      console.log('scrolling -- ' + lastGridOffset + ', ' + pageScrollOffset);
      if (pageScrollOffset >= lastGridOffset) {
        const { listTrackData, pageLimit } = this.state;
        const newPageOffset = listTrackData.length;
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
    console.log('handleQueueClick: ' + encodeURI(uri));
    this.props.httpService
      .post(`/queue-track/${encodeURI(uri)}`)
      .then((data) => {
        //        console.log("play click data: ");
        //        console.log(data);
      })
      .catch((error) => console.log(error));
  };

  handleModalOpen = (albumId) => {
    const { isAuthenticated } = this.props;
    this.setState({
      modalId: albumId,
    });

    if (isAuthenticated && albumId) {
      this.props.httpService
        .get(`/albums/${albumId}`)
        .then((data) => {
          this.setState({
            albumData: {
              tracks: data.tracks,
            },
          });
          console.log(data);
        })
        .catch((error) => console.log(error));
    }
  };

  createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  render() {
    const { playlistData, listTrackData, activeIndex } = this.state;

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
            <p className={'album-details'}>
              <strong>Track</strong>: {item.name}
              <br />
              <strong>Artist</strong>: {item.artist}
              <br />
              <strong>Album</strong>: {item.albumName}
              <br />
              <a href={'http://open.spotify.com/track/' + item.id}>
                Open in Player
              </a>
              <br />
              <button
                style={{ width: '95%' }}
                value={item.uri}
                onClick={() => this.handleQueueClick(item.uri)}
              >
                Queue Track
              </button>
              <br />
              <ModalAlbum
                handleModalOpen={this.handleModalOpen}
                handleModalClose={() => this.setState({ modalId: '' })}
                open={this.state.modalId === item.albumId}
                albumId={item.albumId}
                albumName={item.albumName}
                artist={item.artist}
                image={item.image}
                albumData={this.state.albumData}
              />
            </p>
          </Accordion.Content>
        </Accordion>
      </Grid.Column>
    );

    const AlbumGrid = () => (
      <Grid columns={6} style={{ width: '100%' }}>
        {listTrackData.map((e, index) => GridItem(e, index))}
      </Grid>
    );

    return (
      <div className="App">
        <h1>{playlistData.name}</h1>
        <h3
          dangerouslySetInnerHTML={this.createDescriptionMarkup(
            playlistData.description
          )}
        />
        {listTrackData && listTrackData.length > 0 ? <AlbumGrid /> : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  selectedPlaylist: getSelectedPlaylist(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(PlaylistTracks);
