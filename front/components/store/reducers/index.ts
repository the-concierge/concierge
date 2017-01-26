import multimethod from '../../multimethod';
import dispatcher from './dispatcher'; 
import { ActionType } from '../actions/types';

// Imported for their side-effects
import './containers';
import './hosts';
import './configurations';

const defaultState: AppState = {
    containers: [],
    hosts: [],
    configurations: []
};

export default function reduce(state: AppState = { ...defaultState }, action: ActionType): AppState {
    return dispatcher.dispatch(action.type)(state, action);
}
