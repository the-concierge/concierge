import { AddConfiguration } from '../actions/types';
import * as util from './util';
import { register } from './dispatcher';

const add = {
    types: ['add-configuration'],
    handler: (state: AppState, action: AddConfiguration) => {
      return {
            ...state,
            configurations: util.addEntity(state.configurations, action.configuration)
        }
    }
}

register(add);