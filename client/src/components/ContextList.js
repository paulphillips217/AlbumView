import React from 'react';
import { connect } from 'react-redux';
import '../styles/App.css';
import { List, Image } from 'semantic-ui-react';
import { getContextListData, getContextType } from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextItem,
  setDataLoading,
  setRelatedToArtist,
} from '../store/actions';
import { ContextType } from '../store/types';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';

const ContextList = ({
  contextType,
  contextListData,
  setContextItem,
  setDataLoading,
  setRelatedToArtist,
  setContextGridData,
  setContextGridOffset,
  setContextGridMore,
}) => {
  const theme = useTheme();

  const handleClick = (id) => {
    console.log('handle click id', id);
    setContextGridData([]);
    setContextGridOffset(0);
    setContextGridMore(true);
    if (contextType === ContextType.RelatedArtists) {
      setRelatedToArtist(id);
      setContextItem('');
    } else {
      setContextItem(id);
      setDataLoading(true);
    }
  };

  const ListItem = (item, index) => (
    <List.Item key={index}>
      <Image
        src={item.image}
        size="mini"
        onClick={(e) => handleClick(item.id, e)}
        style={{ cursor: 'pointer' }}
      />
      <List.Content>
        <List.Header>
          <button
            style={theme}
            className="link-button"
            onClick={(e) => handleClick(item.id, e)}
          >
            {item.name}
          </button>
        </List.Header>
        {item.author && (
          <List.Description>
            <div style={theme}>
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
    <div className="left-align-list">
      {contextListData && contextListData.length > 0 ? <ListTable /> : null}
    </div>
  );
};

ContextList.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextListData: PropTypes.array.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setRelatedToArtist: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
  setDataLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextListData: getContextListData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextItem: (id) => dispatch(setContextItem(id)),
  setRelatedToArtist: (id) => dispatch(setRelatedToArtist(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (isMore) => dispatch(setContextGridMore(isMore)),
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextList);
