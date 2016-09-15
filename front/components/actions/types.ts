enum ActionType {
    AddContainer,
    RemoveContainer,
    AddHost,
    RemoveHost,
    // More...
}

export default ActionType;

export interface Action<T extends ActionType> { kind: T }
export type ActionTypes = AddContainer
    | RemoveContainer
    | AddHost
    | RemoveHost

interface AddContainer extends Action<ActionType.AddContainer> {
    container: Concierge.APIContainer;
}

interface RemoveContainer extends Action<ActionType.RemoveContainer> {
    id: number;
}

interface AddHost extends Action<ActionType.AddHost> {
    host: Concierge.APIHost;
}

interface RemoveHost extends Action<ActionType.RemoveHost> {
    id: number;
}