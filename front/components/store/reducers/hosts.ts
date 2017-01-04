import { AddHost, RemoveHost } from '../actions/types';

const add = {
    types: ['add-host'],
    handler: (state: AppState, action: AddHost) => {
        const existing = state.containers.find(container => container.id === action.host.id);
        if (existing) {
            Object.assign(existing, action.host);
            return state;
        }
        const hosts = state.hosts.concat(action.host);
        return Object.assign({}, state, { hosts });
    }
}

const remove = {
    types: ['remove-host'],
    handler: (state: AppState, action: RemoveHost) => {
        const hosts = state.hosts.filter(host => host.id !== action.id);
        return Object.assign({}, state, { hosts });
    }

}

export default [
    add,
    remove
];