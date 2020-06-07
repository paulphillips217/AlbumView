import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { List, Image, Visibility } from 'semantic-ui-react';
import { getImage, sortByArtist } from '../util/utilities';
import {
  getContextListData,
  getContextListMore,
  getContextListOffset,
  getContextType,
} from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextItem,
  setContextListData,
  setContextListMore,
  setContextListOffset, setRelatedToArtist
} from '../store/actions';
import { ContextType, SPOTIFY_PAGE_LIMIT } from '../store/types';
import PropTypes from 'prop-types';

const ContextList = ({
  contextType,
  contextListData,
  contextListOffset,
  contextListMore,
  setContextItem,
  setRelatedToArtist,
  setContextListData,
  setContextListOffset,
  setContextListMore,
  setContextGridData,
  setContextGridOffset,
  setContextGridMore,
  httpService,
}) => {
  useEffect(() => {
    const getList = () => {
      console.log('get context list', contextType);
      switch (contextType) {
        case ContextType.Albums:
        case ContextType.Tracks:
          setContextListData([]);
          setContextListOffset(0);
          setContextListMore(false);
          break;
        case ContextType.RelatedArtists:
        case ContextType.Artists:
          httpService
            .get(`/artist-list/${contextListOffset}/${SPOTIFY_PAGE_LIMIT}`)
            .then((data) => {
              console.log('artist list data', data);
              const parsedData = data.map((e) => ({
                id: e.id,
                name: e.name,
                author: '',
                description: '',
                image: getImage(e.images),
              }));
              setContextListData(
                contextListData.concat(parsedData).sort(sortByArtist)
              );
              setContextListMore(data && data.artists && !!(data.artists.next));
            })
            .catch((error) => console.log(error));
          break;
        case ContextType.Playlists:
          httpService
            .get(`/playlist-list/${contextListOffset}/${SPOTIFY_PAGE_LIMIT}`)
            .then((data) => {
              const parsedData = data.items.map((e) => ({
                id: e.id,
                name: e.name,
                author: e.owner.display_name,
                description: e.description,
                image: getImage(e.images),
              }));
              setContextListData(contextListData.concat(parsedData));
              setContextListMore(!!data.next);
            })
            .catch((error) => console.log(error));
          break;
        default:
          console.log(
            'unknown context type in ContextList.getList',
            contextType
          );
      }
    };

    getList();
  }, [contextType, contextListOffset]);

  const handleClick = (id) => {
    console.log('handle click id', id);
    setContextGridData([]);
    setContextGridOffset(0);
    setContextGridMore(false);
    if (contextType === ContextType.Artists) {
      setContextItem(id);
    }
    else {
      setRelatedToArtist(id);
    }
  };

  const handleVisibilityUpdate = (e, { calculations }) => {
    if (
      calculations.bottomVisible &&
      contextListOffset < contextListData.length &&
      contextListMore
    ) {
      console.log('list bottom reached - increase page offset');
      const newPageOffset = contextListData.length;
      setContextListOffset(newPageOffset);
    }
  };

  const ListItem = (item, index) => (
    <List.Item key={index}>
      <Image src={item.image} size="mini" />
      <List.Content>
        <List.Header>
          <button
            className="link-button"
            onClick={(e) => handleClick(item.id, e)}
          >
            {item.name}
          </button>
        </List.Header>
        {item.author && (
          <List.Description>
            <div>
              by: {item.author} <br />
            </div>
          </List.Description>
        )}
      </List.Content>
    </List.Item>
  );

  const ListTable = () => (
    <List floated={'left'} divided relaxed>
      {contextListData.map((item, index) => ListItem(item, index))}
    </List>
  );

  return (
    <Visibility onUpdate={handleVisibilityUpdate}>
      <div className="left-align-list">
        {contextListData && contextListData.length > 0 ? <ListTable /> : null}
      </div>
    </Visibility>
  );
};

ContextList.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextListData: PropTypes.array.isRequired,
  contextListOffset: PropTypes.number.isRequired,
  contextListMore: PropTypes.bool.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextListData: PropTypes.func.isRequired,
  setContextListOffset: PropTypes.func.isRequired,
  setContextListMore: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextListData: getContextListData(state),
  contextListOffset: getContextListOffset(state),
  contextListMore: getContextListMore(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextListData: (data) => dispatch(setContextListData(data)),
  setContextListOffset: (offset) => dispatch(setContextListOffset(offset)),
  setContextListMore: (offset) => dispatch(setContextListMore(offset)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (offset) => dispatch(setContextGridMore(offset)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContextList);
