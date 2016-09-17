interface Action<T> {
    kind: T
}

export const ADD_CONTAINER = 'ADD_CONTAINER';
export const REMOVE_CONTAINER = 'REMOVE_CONTAINER';
export const ADD_HOST = 'ADD_HOST';
export const REMOVE_HOST = 'REMOVE_HOST';

export type ActionType = AddContainer
    | RemoveContainer
    | AddHost
    | RemoveHost

export interface AddContainer extends Action<typeof ADD_CONTAINER> {
    container: Concierge.APIContainer;
}

export interface RemoveContainer extends Action<typeof REMOVE_CONTAINER> {
    id: number;
}

export interface AddHost extends Action<typeof ADD_HOST> {
    host: Concierge.APIHost;
}

export interface RemoveHost extends Action<typeof REMOVE_HOST> {
    id: number;
}
