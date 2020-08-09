import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import { Button, List, Image } from 'semantic-ui-react';
import { sortByName } from '../util/sortUtils';
import { getRelatedToArtist } from '../store/selectors';
import { setContextGridData, setContextItem, setDataLoading } from '../store/actions';
import HttpService from '../util/httpUtils';

const RelatedArtistList = ({
  relatedToArtist,
  setItem,
  setLoading,
  setGridData,
  httpService,
}) => {
  const theme = useTheme();
  const [relatedArtistListData, setRelatedArtistListData] = useState([]);

  useEffect(() => {
    const getList = () => {
      console.log('get related artist list', relatedToArtist);
      if (relatedToArtist) {
        httpService
          .get(`/spotify/related-artists/${relatedToArtist}`)
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
  }, [relatedToArtist, httpService]);

  const handleClick = (id) => {
    console.log('handle click id', id);
    setGridData({ spotifyCount: 0, data: [] });
    setItem(id);
    setLoading(true);
  };

  const ListItem = (item, index) => (
    <List.Item key={index}>
      <Image src={item.image} size="mini" />
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
            <div>
              by: 
              {' '}
              {item.author} 
              {' '}
              <br />
            </div>
          </List.Description>
        )}
      </List.Content>
    </List.Item>
  );

  const ListTable = () => (
    <List floated="left" divided relaxed>
      {relatedArtistListData.map((item, index) => ListItem(item, index))}
    </List>
  );

  return (
    <div className="left-align-list">
      {relatedArtistListData.length > 0 ? <ListTable /> : null}
    </div>
  );
};

RelatedArtistList.propTypes = {
  relatedToArtist: PropTypes.string.isRequired,
  setItem: PropTypes.func.isRequired,
  setGridData: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  httpService: PropTypes.instanceOf(HttpService).isRequired,
};

const mapStateToProps = (state) => ({
  relatedToArtist: getRelatedToArtist(state),
});

const mapDispatchToProps = (dispatch) => ({
  setItem: (id) => dispatch(setContextItem(id)),
  setGridData: (data) => dispatch(setContextGridData(data)),
  setLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RelatedArtistList);
