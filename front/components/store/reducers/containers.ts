import { AddContainer, RemoveContainer } from '../actions/types';

const add = {
    types: ['add-container'],
    handler: (state: AppState, action: AddContainer) => {
        const existing = state.containers.find(container => container.id === action.container.id);
        if (existing) {
            Object.assign(existing, action.container);
            return state;
        }
        const containers = state.containers.concat(action.container);
        return Object.assign({}, state, { containers });
    }
}

const remove = {
    types: ['remove-container'],
    handler: (state: AppState, action: RemoveContainer) => {
        const containers = state.containers.filter(container => container.id !== action.id);
        return Object.assign({}, state, { containers });
    }

}

export default [
    add,
    remove
];