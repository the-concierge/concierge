import * as Actions from '../actions/types';
import ActionType = Actions.ActionType;

export default function store(state: ApplicationState = { containers: [], hosts: [] }, action: ActionType): ApplicationState {
    switch (action.kind) {
        case Actions.ADD_CONTAINER:
            return Object.assign(
                {},
                state,
                { containers: [...state.containers, action.container] }
            )
        case Actions.ADD_HOST:
            return Object.assign(
                {},
                state,
                { hosts: [...state.hosts, action.host] }
            )
        case Actions.REMOVE_HOST:
            return Object.assign(
                {},
                state,
                { containers: state.containers.filter(c => c.id !== action.id) }
            )
        case Actions.REMOVE_CONTAINER:
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

