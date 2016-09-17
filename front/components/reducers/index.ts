import {ActionType} from '../actions/types';

export default function store(state: ApplicationState = { containers: [], hosts: [] }, action: ActionType): ApplicationState {
    switch (action.kind) {
        case 'ADD_CONTAINER':
            return Object.assign(
                {},
                state,
                { containers: [...state.containers, action.container] }
            )
        case 'ADD_HOST':
            return Object.assign(
                {},
                state,
                { hosts: [...state.hosts, action.host] }
            )
        case 'REMOVE_CONTAINER':
            return Object.assign(
                {},
                state,
                { containers: state.containers.filter(c => c.id !== action.id) }
            )
        case 'REMOVE_CONTAINER':
            return Object.assign(
                {},
                state,
                { hosts: state.hosts.filter(c => c.id !== action.id) }
            )
    }
}

interface ApplicationState {
    containers: Array<Concierge.APIContainer>;
    hosts: Array<Concierge.APIHost>;
}

