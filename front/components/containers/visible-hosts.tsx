import { connect } from 'react-redux';
import HostList from '../shell/hosts/list';

const mapStateToProps = (state: AppState) => {
    return state;
}

const VisibleHostList = connect(
    mapStateToProps
)(HostList);

export default VisibleHostList;