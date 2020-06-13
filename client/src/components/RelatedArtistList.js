import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { List, Image } from 'semantic-ui-react';
import '../styles/App.css';
import { sortByName } from '../util/utilities';
import { getRelatedToArtist } from '../store/selectors';
import {
  setContextGridData,
  setContextGridMore,
  setContextGridOffset,
  setContextItem,
} from '../store/actions';
import { useTheme } from 'emotion-theming';

const RelatedArtistList = ({
  relatedToArtist,
  setContextItem,
  setContextGridData,
  setContextGridOffset,
  setContextGridMore,
  httpService,
}) => {
  const theme = useTheme();
  const [relatedArtistListData, setRelatedArtistListData] = useState([]);

  useEffect(() => {
    const getList = () => {
      console.log('get related artist list', relatedToArtist);
      if (relatedToArtist) {
        httpService
          .get(`/related-artists/${relatedToArtist}`)
          .then((data) => {
            console.log('related artist list data', data);
            const parsedData = data.artists.map((e) => ({
              id: e.id,
              name: e.name,
              author: '',
              description: '',
              image: '',
            }));
            setRelatedArtistListData(parsedData.sort(sortByName));
          })
          .catch((error) => console.log(error));
      }
    };

    getList();
  }, [relatedToArtist]);

  const handleClick = (id) => {
    console.log('handle click id', id);
    setContextGridData([]);
    setContextGridOffset(0);
    setContextGridMore(false);
    setContextItem(id);
  };

  const ListItem = (item, index) => (
    <List.Item key={index}>
      <Image src={item.image} size="mini" />
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
      {relatedArtistListData.map((item, index) => ListItem(item, index))}
    </List>
  );

  return (
    <div className="left-align-list">
      {relatedArtistListData && relatedArtistListData.length > 0 ? (
        <ListTable />
      ) : null}
    </div>
  );
};

RelatedArtistList.propTypes = {
  relatedToArtist: PropTypes.string.isRequired,
  httpService: PropTypes.object.isRequired,
  setContextItem: PropTypes.func.isRequired,
  setContextGridData: PropTypes.func.isRequired,
  setContextGridOffset: PropTypes.func.isRequired,
  setContextGridMore: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  relatedToArtist: getRelatedToArtist(state),
});

const mapDispatchToProps = (dispatch) => ({
  setContextItem: (id) => dispatch(setContextItem(id)),
  setContextGridData: (data) => dispatch(setContextGridData(data)),
  setContextGridOffset: (offset) => dispatch(setContextGridOffset(offset)),
  setContextGridMore: (offset) => dispatch(setContextGridMore(offset)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RelatedArtistList);
