import ActionType, { ActionTypes } from '../actions/types';

function store(state: ApplicationState = { containers: [], hosts: [] }, action: ActionTypes): ApplicationState {
    switch (action.kind) {
        case ActionType.AddContainer:
            return Object.assign(
                {},
                state,
                { containers: [...state.containers, action.container] }
            )
        case ActionType.AddHost:
            return Object.assign(
                {},
                state,
                { containers: [...state.containers, action.host] }
            )
        case ActionType.RemoveContainer:
            return Object.assign(
                {},
                state,
                { containers: state.containers.filter(c => c.id !== action.id) }
            )
        case ActionType.RemoveHost:
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

