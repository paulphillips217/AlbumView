import React, { Component } from 'react';
import { connect } from "react-redux";
import '../styles/App.css';
import {Link, NavLink} from "react-router-dom";
import {List, Image} from "semantic-ui-react";
import {getImage} from '../util/utilities';

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
    window.addEventListener("scroll", e => {
      this.handleScroll(e);
    });
    const { pageOffset, pageLimit } = this.state;
    this.getPlaylists(pageOffset, pageLimit);
  }

  getPlaylists = (pageOffset, pageLimit) => {
    const isUserAuthorized = this.props.authentication.authenticated;
    const { playlistData } = this.state;

    if (isUserAuthorized) {
      fetch(`/playlists/${pageOffset}/${pageLimit}`)
        .then(res => res.json())
        .then(rawData => {
//          console.log(rawData);
          const data = rawData.items.map(e => ({
            id: e.id,
            name: e.name,
            author: e.owner.display_name,
            description: e.description,
            image: getImage(e.images),
            }));
          const newData = playlistData.concat(data);
          this.setState({
            playlistData: newData,
            moreDataAvailable: rawData.next != null
          });
        })
        .catch(error => console.log(error));
    }
    else {
      this.props.history.push('/');
    }
  };

  handleScroll = (e) => {
    const bigGrid = document.querySelector(".left-align-list");
    console.log('scrolling: ' + bigGrid != null);
    if (bigGrid) {
      const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
      const pageScrollOffset = window.pageYOffset + window.innerHeight;
      console.log('scrolling -- ' + lastGridOffset + ', ' + pageScrollOffset);
      if (pageScrollOffset > lastGridOffset) {
        const { playlistData, pageLimit } = this.state;
        const newPageOffset = playlistData.length;
        this.setState({
          pageOffset: newPageOffset
        });
        this.getPlaylists(newPageOffset, pageLimit);
      }
    }
  };

  createDescriptionMarkup = (text) => {
    return {__html: text};
  };

  render() {
    const { playlistData } = this.state;

    const PlaylistItem = (item, index) => (
      <List.Item key={index}>
        <Image src={item.image} size='mini' />
        <List.Content>
          <List.Header as={NavLink} to={'/playlist-tracks/' + item.id}>{item.name}</List.Header>
          <List.Description>
            <p>
              by: {item.author} <br/>
              <div dangerouslySetInnerHTML={this.createDescriptionMarkup(item.description)} />
            </p>
          </List.Description>
        </List.Content>
      </List.Item>
    );

    const PlaylistTable = () => (
      <List floated={'left'} divided relaxed>
          {playlistData.map((item, index) => PlaylistItem(item, index))}
      </List>
    );

    return (
      <div className="App">
        <h1>Your Spotify Playlists</h1>
        <div className='left-align-list'>
          {playlistData.length !== 0 ? <PlaylistTable /> : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  authentication: state.authentication
});

export default connect(
  mapStateToProps
)(Playlists);
