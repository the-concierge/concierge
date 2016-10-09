import { createStore } from 'redux';
import stateHandler from '../reducers/index';
import * as containers from './containers/index';
import * as hosts from './hosts/index';
import * as action from '../actions/creators';

// Hook up the store with Redux dev tools
const win: any = window;
const store = createStore(
    stateHandler,
    win.__REDUX_DEVTOOLS_EXTENSION__ && win.__REDUX_DEVTOOLS_EXTENSION__()
);
const dispatch = (actionKind: string, dispatchObject: {}) => store.dispatch(Object.assign(dispatchObject, { type: actionKind }));

// Initialisation
containers
    .all()
    .then(list => list.forEach(c => store.dispatch(action.addContainer(c))));

hosts
    .all()
    .then(list => list.forEach(h => store.dispatch(action.addHost(h))));

export default store;