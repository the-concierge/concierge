import {createStore} from 'redux';
import stateHandler from '../reducers/index';

const store = createStore(stateHandler);

export default store;