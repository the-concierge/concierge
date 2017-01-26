import multimethod from '../../multimethod';
import * as Actions from '../actions/types';
import ActionType = Actions.ActionType;

type Action = { type: string };
type ActionHandler = (state: AppState, action: ActionType) => AppState;

const dispatcher = multimethod<ActionHandler, string>({
    name: 'action reducer',
    params: [
        {
            name: 'action type',
            isa: (special, general) => special === general
        }
    ]
});

dispatcher.override(
    ['@@INIT'],
    () => (state: AppState, action: any) => state
);

type Reducer = {
    types: string[],
    handler: (state: AppState, action: ActionType) => AppState
}

export function register(...reducers: Reducer[]) {
    reducers
        .forEach(reducer => dispatcher.override(reducer.types, () => reducer.handler));
}

export default dispatcher;