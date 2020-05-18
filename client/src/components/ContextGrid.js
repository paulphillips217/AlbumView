import React, { Component } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { Grid } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import {
  getAuthenticationState,
  getContextType,
  getContextItem,
} from '../store/selectors';
import httpService from '../util/httpUtils';
import AlbumAccordion from './AlbumAccordion';
import { ContextType, GridDataType } from '../store/types';

const PAGE_LIMIT = 50;

class ContextGrid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contextData: {
        name: '',
        gridDataType: GridDataType.Track,
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
    const { contextType, contextItem } = this.props;

    switch (contextType) {
      case ContextType.Albums:
        this.setState({
          contextData: {
            name: 'Your Saved Albums',
            gridDataType: GridDataType.Album,
            description: '',
          },
        });
        break;
      case ContextType.Playlists:
        this.props.httpService
          .get(`/playlist-data/${contextItem}`)
          .then((data) => {
            this.setState({
              contextData: {
                name: data.name,
                gridDataType: GridDataType.Track,
                description: data.description,
              },
            });
          })
          .catch((error) => console.log(error));
        break;
      default:
        console.log(
          'unknown context type in ContextGrid.getContextData',
          contextType
        );
    }
  };

  getGridData = (pageOffset) => {
    const { gridData } = this.state;
    const { contextType, contextItem } = this.props;
    console.log('getGridData: ', contextType, contextItem, pageOffset);

    switch (contextType) {
      case ContextType.Albums:
        this.props.httpService
          .get(`/album-list/${pageOffset}/${PAGE_LIMIT}`)
          .then((rawData) => {
            console.log('artist data', rawData);
            const data = rawData.items.map((e) => ({
              id: '',
              name: '',
              albumId: e.album.id,
              albumName: e.album.name,
              artist: e.album.artists[0].name,
              image: getImage(e.album.images),
              href: e.href,
              uri: e.uri,
            }));
            const newData = pageOffset ? gridData.concat(data) : data;
            this.setState({
              gridData: newData,
              moreDataAvailable: rawData.next != null,
            });
          })
          .catch((error) => console.log(error));
        break;
      case ContextType.Playlists:
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
        break;
      default:
        console.log(
          'unknown context type in ContextGrid.getGridData',
          contextType
        );
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
    if (
      this.props.contextType !== prevProps.contextType ||
      this.props.contextItem !== prevProps.contextItem
    ) {
      console.log('time to update the grid data');

      this.setState({
        gridData: [],
        pageOffset: 0,
        moreDataAvailable: true,
        activeIndex: -1,
        albumData: {},
      });

      const { pageOffset } = this.state;
      this.getContextData();
      this.getGridData(pageOffset);
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
          activeIndex={activeIndex}
          index={index}
          item={item}
          gridDataType={contextData.gridDataType}
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
  contextType: getContextType(state),
  contextItem: getContextItem(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  httpService: stateProps.httpServiceFromState(dispatchProps.dispatch),
});

export default connect(mapStateToProps, null, mergeProps)(ContextGrid);
