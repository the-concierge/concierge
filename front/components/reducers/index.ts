import * as Actions from '../actions/types';
import ActionType = Actions.ActionType;

export default function store(state: ApplicationState = { containers: [], hosts: [] }, action: ActionType): ApplicationState {
    switch (action.kind) {
        case 'add-container':
            return Object.assign(
                {},
                state,
                { containers: [...state.containers, action.container] }
            )
        case 'add-host':
            return Object.assign(
                {},
                state,
                { hosts: [...state.hosts, action.host] }
            )
        case 'remove-host':
            return Object.assign(
                {},
                state,
                { containers: state.containers.filter(c => c.id !== action.id) }
            )
        case 'remove-container':
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

