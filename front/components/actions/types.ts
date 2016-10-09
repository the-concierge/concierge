export type ActionType = AddContainer
    | RemoveContainer
    | AddHost
    | RemoveHost

export interface AddContainer {
    kind: 'add-container';
    container: Concierge.APIContainer;
}

export interface RemoveContainer {
    kind: 'remove-container';
    id: number;
}

export interface AddHost {
    kind: 'add-host';
    host: Concierge.APIHost;
}

export interface RemoveHost {
    kind: 'remove-host';
    id: number;
}
