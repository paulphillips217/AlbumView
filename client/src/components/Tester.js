import React from 'react';
import { Header, Segment, Sidebar } from 'semantic-ui-react';
import Playlists from './playlists';
import PlaylistTracks from './playlistTracks';

const Tester = () => (
  <Sidebar.Pushable as={Segment}>
    <Sidebar animation="push" icon="labeled" vertical visible width="thin">
      <Playlists />
    </Sidebar>

    <Sidebar.Pusher>
      <Segment basic style={{ height: 'calc(100vh - 80px)' }}>
        <Header as="h3">Application Content</Header>
        <PlaylistTracks />
      </Segment>
    </Sidebar.Pusher>
  </Sidebar.Pushable>
);

export default Tester;
