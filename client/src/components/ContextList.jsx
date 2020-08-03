import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Button, List, Image } from 'semantic-ui-react';
import { getContextListData, getContextType } from '../store/selectors';
import {
  setContextGridData,
  setContextItem,
  setDataLoading,
  setRelatedToArtist,
} from '../store/actions';
import { ContextType } from '../store/types';

const ContextList = ({
  contextType,
  contextListData,
  setItem,
  setLoading,
  setRelatedTo,
  setGridData,
}) => {
  const theme = useTheme();

  const handleClick = (id) => {
    console.log('handle click id', id);
    setGridData({ spotifyCount: 0, data: [] });
    if (contextType === ContextType.RelatedArtists) {
      setRelatedTo(id);
      setItem('');
    } else {
      setItem(id);
      setLoading(true);
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
          <Button
            style={theme}
            className="link-button"
            onClick={(e) => handleClick(item.id, e)}
          >
            {item.name}
          </Button>
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
    <List floated="left" divided relaxed>
      {contextListData.data.map((item, index) => ListItem(item, index))}
    </List>
  );

  return (
    <div className="left-align-list">
      {contextListData.data.length > 0 ? <ListTable /> : null}
    </div>
  );
};

ContextList.propTypes = {
  contextType: PropTypes.string.isRequired,
  contextListData: PropTypes.shape({
    spotifyCount: PropTypes.number,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        author: PropTypes.string,
        description: PropTypes.string,
        image: PropTypes.string,
      })
    ),
  }).isRequired,
  setItem: PropTypes.func.isRequired,
  setRelatedTo: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  contextType: getContextType(state),
  contextListData: getContextListData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setItem: (id) => dispatch(setContextItem(id)),
  setRelatedTo: (id) => dispatch(setRelatedToArtist(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextList);
