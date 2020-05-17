import React from 'react';
import { Header, Segment, Sidebar } from 'semantic-ui-react';
import ContextList from './ContextList';
import ContextGrid from './ContextGrid';

const Tester = () => (
  <Sidebar.Pushable as={Segment}>
    <Sidebar animation="push" icon="labeled" vertical visible width="thin">
      <ContextList />
    </Sidebar>

    <Sidebar.Pusher>
      <Segment basic style={{ height: 'calc(100vh - 80px)' }}>
        <Header as="h3">Application Content</Header>
        <ContextGrid />
      </Segment>
    </Sidebar.Pusher>
  </Sidebar.Pushable>
);

export default Tester;
