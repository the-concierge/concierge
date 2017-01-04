import * as Actions from '../actions/types';
import ActionType = Actions.ActionType;
import multimethod from '../../multimethod';
import containers from './containers';
import hosts from './hosts';

type Action = { type: string };
type ActionHandler = (state: AppState, action: ActionType) => AppState;

export const dispatcher = multimethod<ActionHandler, string>({
    name: 'action reducer',
    params: [
        {
            name: 'action type',
            isa: (special, general) => special === general
        }
    ]
});

const reducers = [
    ...containers,
    ...hosts
];

reducers
    .forEach(reducer => dispatcher.override(reducer.types, () => reducer.handler));

export default function reduce(state: AppState = { containers: [], hosts: [] }, action: ActionType): AppState {
    return dispatcher.dispatch(action.type)(state, action);
}
