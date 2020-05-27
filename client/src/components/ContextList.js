import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { List, Image, Visibility } from 'semantic-ui-react';
import { getImage } from '../util/utilities';
import { getContextType } from '../store/selectors';
import { setContextItem } from '../store/actions';
import httpService from '../util/httpUtils';
import { ContextType, SPOTIFY_PAGE_LIMIT } from '../store/types';
import PropTypes from 'prop-types';

const ContextList = ({ contextType, setContextItem, httpService }) => {
  const [listData, setListData] = useState([]);
  const [pageOffset, setPageOffset] = useState(0);

  useEffect(() => {
    const getList = () => {
      switch (contextType) {
        case ContextType.Albums:
        case ContextType.Tracks:
          setListData([]);
          setPageOffset(0);
          break;
        case ContextType.Playlists:
          httpService
            .get(`/playlist-list/${pageOffset}/${SPOTIFY_PAGE_LIMIT}`)
            .then((data) => {
              const parsedData = data.items.map((e) => ({
                id: e.id,
                name: e.name,
                author: e.owner.display_name,
                description: e.description,
                image: getImage(e.images),
              }));
              setListData(listData.concat(parsedData));
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
  }, [contextType, pageOffset, httpService]);

  const handleClick = (id) => {
    console.log('handle click id', id);
    setContextItem(id);
  };

  const handleVisibilityUpdate = (e, { calculations }) => {
    if (calculations.bottomVisible && pageOffset < listData.length) {
      console.log('list bottom reached - increase page offset');
      const newPageOffset = listData.length;
      setPageOffset(newPageOffset);
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

  return (
    <Visibility onUpdate={handleVisibilityUpdate}>
      <div className="left-align-list">
        {listData && listData.length > 0 ? <ListTable /> : null}
      </div>
    </Visibility>
  );
};

ContextList.propTypes = {
  contextType: PropTypes.string.isRequired,
  setContextItem: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  httpServiceFromState: (dispatch) => new httpService(state, dispatch),
});

const mapDispatchToProps = (dispatch) => ({
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
