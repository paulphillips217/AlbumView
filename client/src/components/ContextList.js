import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { List, Image, Dropdown } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import { getAuthenticationState, getContextType } from '../store/selectors';
import { setContextType, setContextItem } from '../store/actions';
import httpService from '../util/httpUtils';
import { ContextType } from '../store/types';

const PAGE_LIMIT = 50;

class ContextList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      pageOffset: 0,
      moreDataAvailable: true,
    };
  }

  componentDidMount() {
    console.log('playlist componentDidMount');
    const { pageOffset } = this.state;
    this.getList(this.props.contextType, pageOffset);

    // connect up the scrolling mechanism
    const node = document.querySelector('.Pane1');
    if (node) {
      node.addEventListener('scroll', (e) => {
        this.handleScroll(e);
      });
    }
  }

  getList = (contextType, pageOffset) => {
    const { listData } = this.state;

    switch (contextType) {
      case ContextType.Albums:
        this.setState({
          listData: [],
          pageOffset: 0,
          moreDataAvailable: false,
        });
        break;
      case ContextType.Playlists:
        this.props.httpService
          .get(`/playlist-list/${pageOffset}/${PAGE_LIMIT}`)
          .then((data) => {
            const parsedData = data.items.map((e) => ({
              id: e.id,
              name: e.name,
              author: e.owner.display_name,
              description: e.description,
              image: getImage(e.images),
            }));
            const newData = listData.concat(parsedData);
            this.setState({
              listData: newData,
              moreDataAvailable: data.next != null,
            });
          })
          .catch((error) => console.log(error));
        break;
      default:
        console.log('unknown context type in ContextList.getList', contextType);
    }
  };

  handleScroll = () => {
    const bigGrid = document.querySelector('.left-align-list');
    //    console.log("scrolling: " + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector('.Pane1');
      if (node) {
        const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
        const pageScrollOffset = node.scrollTop + node.offsetHeight;
        //      console.log("scrolling -- " + lastGridOffset + ", " + pageScrollOffset);
        if (pageScrollOffset >= lastGridOffset) {
          const { listData } = this.state;
          const newPageOffset = listData.length;
          this.setState({
            pageOffset: newPageOffset,
          });
          this.getList(this.props.contextType, newPageOffset);
        }
      }
    }
  };

  handleClick = (id) => {
    this.props.setContextItem(id);
  };

  handleDropdownChange = (e, { value }) => {
    this.props.setContextType(value);
    this.getList(value, 0);
  };

  render() {
    const { listData } = this.state;

    const ListItem = (item, index) => (
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

    const ListTable = () => (
      <List floated={'left'} divided relaxed>
        {listData.map((item, index) => ListItem(item, index))}
      </List>
    );

    const listOptions = [
      {
        key: 'playlists-key',
        text: 'Your Spotify Playlists',
        value: ContextType.Playlists,
      },
      {
        key: 'saved-album-key',
        text: 'Your Saved Albums',
        value: ContextType.Albums,
      },
    ];

    return (
      <div className="App">
        <h1>
          <Dropdown
            inline
            options={listOptions}
            defaultValue={this.props.contextType}
            onChange={this.handleDropdownChange}
          />
        </h1>
        <div className="left-align-list">
          {listData && listData.length > 0 ? <ListTable /> : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  contextType: getContextType(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mapDispatchToProps = (dispatch) => ({
  setContextType: (type) => dispatch(setContextType(type)),
  setContextItem: (id) => dispatch(setContextItem(id)),
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
)(ContextList);
