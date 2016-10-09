import { connect } from 'react-redux';
import ContainerList from '../shell/containers/list';

const mapStateToProps = (state: AppState) => {
    return state;
}

const VisibleContainerList = connect(
    mapStateToProps
)(ContainerList);

export default VisibleContainerList;