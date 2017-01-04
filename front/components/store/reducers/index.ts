import * as Actions from '../actions/types';
import ActionType = Actions.ActionType;
import multimethod from '../../multimethod';

const single = multimethod<(state: AppState, action: ActionType) => AppState, string>({
    name: 'reducer',
    params: [
        {
            name: 'action type',
            isa: (special, general) => special === general
        }
    ]
});

single.override(['add-container'], () => (state: AppState, action: Actions.AddContainer) => {
    return {
        ...state,
        containers: addEntity(state.containers, action.container)
    }
});

single.override(['remove-container'], () => (state: AppState, action: Actions.RemoveContainer) => {
    return {
        ...state,
        containers: state.containers.filter(container => container.id !== action.id)
    }
});

single.override(['add-host'], () => (state: AppState, action: Actions.AddHost) => {
    return {
        ...state,
        hosts: addEntity(state.hosts, action.host)
    }
});

single.override(['remove-host'], () => (state: AppState, action: Actions.RemoveHost) => {
    return {
        ...state,
        hosts: state.hosts.filter(host => host.id !== action.id)
    }
});

export default function reduce(state: AppState = { containers: [], hosts: [] }, action: ActionType): AppState {
    switch (action.type) {
        case 'add-container':
            return Object.assign(
                {},
                state,
                { containers: addEntity(state.containers, action.container) }
            );

        case 'add-host':
            return Object.assign(
                {},
                state,
                { hosts: addEntity(state.hosts, action.host) }
            );

        case 'remove-host':
            return Object.assign(
                {},
                state,
                { hosts: state.hosts.filter(c => c.id !== action.id) }
            );

        case 'remove-container':
            return Object.assign(
                {},
                state,
                { containers: state.containers.filter(c => c.id !== action.id) }
            );

        default:
            return state;
    }
}

type Id = { id?: string | number }

/**
 * Destructive
 * Add or update
 */
function addEntity<T extends Id>(entities: Array<T>, entity: T) {
    const existing = entities.find(c => c.id === entity.id);
    if (existing) {
        Object.assign(existing, entity);
        return entities;
    }
    return entities.concat(entity);
}

function removeEntity<T extends Id>(state: AppState, entities: Array<T>, entityId: string | number) {
    const filtered = entities.filter(entity => entity.id !== entityId);
    return filtered;
}