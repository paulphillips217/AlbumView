import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTheme } from 'emotion-theming';
import '../styles/App.css';
import '../styles/splitPane.css';
import '../styles/flex-height.css';
import AlbumViewHeader from './AlbumViewHeader';
import PropTypes from 'prop-types';
import { getSavedAlbumData } from '../store/selectors';
import { setDataLoading } from '../store/actions';
import LocalFiles from './LocalFiles';

const LocalFileContext = ({ savedAlbumData, setDataLoading, httpService }) => {
  const theme = useTheme();

  useEffect(() => {
    const getLastFmData = () => {
      httpService
        .get(`/last-album`)
        .then((rawData) => {
          console.log('Last.fm data', rawData);
        })
        .catch((error) => console.log(error));
    };
    getLastFmData();
  }, []);

  setDataLoading(false);

  const contextData = {
    name: 'Local File Analysis',
    description: '',
  };

  return (
    <div className="box" style={theme}>
      <div className="row header" style={{ paddingBottom: '5px' }}>
        <AlbumViewHeader contextData={contextData} httpService={httpService} />
      </div>
      <div className="row content">
        <LocalFiles savedAlbumData={savedAlbumData} httpService={httpService} />
      </div>
      <div className="row footer"> </div>
    </div>
  );
};

LocalFileContext.propTypes = {
  savedAlbumData: PropTypes.object.isRequired,
  setDataLoading: PropTypes.func.isRequired,
  httpService: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  savedAlbumData: getSavedAlbumData(state),
});

const mapDispatchToProps = (dispatch) => ({
  setDataLoading: (isLoading) => dispatch(setDataLoading(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LocalFileContext);
