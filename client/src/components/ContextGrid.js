import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import { getAuthenticationState, getContextItem } from '../store/selectors';
import httpService from '../util/httpUtils';
import AlbumAccordion from './AlbumAccordion';

const PAGE_LIMIT = 50;

class ContextGrid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contextData: {
        id: '',
        name: '',
        description: '',
      },
      gridData: [],
      pageOffset: 0,
      moreDataAvailable: true,
      activeIndex: -1,
      albumData: {},
    };
  }

  getContextData = () => {
    const { isAuthenticated, contextItem } = this.props;
    console.log('getContextData: ' + contextItem);

    if (isAuthenticated && contextItem) {
      this.props.httpService
        .get(`/playlist-data/${contextItem}`)
        .then((data) => {
          this.setState({
            contextData: {
              id: data.id,
              name: data.name,
              description: data.description,
            },
          });
        })
        .catch((error) => console.log(error));
    }
  };

  getGridData = (pageOffset) => {
    const { gridData } = this.state;
    const { isAuthenticated, contextItem } = this.props;
    console.log('getGridData: ' + contextItem + ', ' + pageOffset);

    if (isAuthenticated && contextItem) {
      this.props.httpService
        .get(`/playlist-tracks/${contextItem}/${pageOffset}/${PAGE_LIMIT}`)
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
          const newData = pageOffset ? gridData.concat(data) : data;
          this.setState({
            gridData: newData,
            moreDataAvailable: rawData.next != null,
          });
        })
        .catch((error) => console.log(error));
    } else {
      this.props.history.push('/');
    }
  };

  componentDidMount() {
    console.log('ContextGrid did mount');
    const { isAuthenticated, contextItem } = this.props;

    // connect up the scrolling mechanism
    const node = document.querySelector('.Pane2');
    if (node) {
      node.addEventListener('scroll', (e) => {
        this.handleScroll(e);
      });
    }

    if (isAuthenticated && contextItem) {
      const { pageOffset } = this.state;
      this.getContextData();
      this.getGridData(pageOffset);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.contextItem !== prevProps.contextItem) {
      console.log('time to update the grid data');

      this.setState({
        gridData: [],
        pageOffset: 0,
        moreDataAvailable: true,
        activeIndex: -1,
        albumData: {},
      });

      const { isAuthenticated, contextItem } = this.props;
      if (isAuthenticated && contextItem) {
        const { pageOffset } = this.state;
        this.getContextData();
        this.getGridData(pageOffset);
      }
    }
  }

  handleScroll = () => {
    const bigGrid = document.querySelector('.column:last-child');
    //    console.log('scrolling: ' + bigGrid != null);
    if (bigGrid) {
      const node = document.querySelector('.Pane2');
      const lastGridOffset = bigGrid.offsetTop + bigGrid.clientHeight;
      //      const pageScrollOffset = window.pageYOffset + window.innerHeight;
      const pageScrollOffset = node.scrollTop + node.offsetHeight;
      //      console.log('scrolling -- ' + lastGridOffset + ', ' + pageScrollOffset);
      if (pageScrollOffset >= lastGridOffset) {
        const { gridData } = this.state;
        const newPageOffset = gridData.length;
        this.setState({
          pageOffset: newPageOffset,
        });
        this.getGridData(newPageOffset);
      }
    }
  };

  handleAccordionClick = (index) => {
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  createDescriptionMarkup = (text) => {
    return { __html: text };
  };

  render() {
    const { contextData, gridData, activeIndex } = this.state;

    const GridItem = (item, index) => (
      <Grid.Column key={index}>
        <AlbumAccordion
          item={item}
          activeIndex={activeIndex}
          index={index}
          handleAccordionClick={this.handleAccordionClick}
        />
      </Grid.Column>
    );

    const AlbumGrid = () => (
      <Grid columns={6} style={{ width: '100%' }}>
        {gridData.map((e, index) => GridItem(e, index))}
      </Grid>
    );

    return (
      <div className="App">
        <h1>{contextData.name}</h1>
        <h3
          dangerouslySetInnerHTML={this.createDescriptionMarkup(
            contextData.description
          )}
        />
        {gridData && gridData.length > 0 ? <AlbumGrid /> : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: getAuthenticationState(state),
  contextItem: getContextItem(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(ContextGrid);
