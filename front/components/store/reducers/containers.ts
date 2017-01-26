import { AddContainer, RemoveContainer } from '../actions/types';
import * as util from './util';
import { register } from './dispatcher';

const add = {
    types: ['add-container'],
    handler: (state: AppState, action: AddContainer) => {
      return {
            ...state,
            containers: util.addEntity(state.containers, action.container)
        }
    }
}

const remove = {
    types: ['remove-container'],
    handler: (state: AppState, action: RemoveContainer) => {
        return {
            ...state,
            containers: util.removeEntity(state, state.containers, action.id)
        }
    }
}

register(add, remove);