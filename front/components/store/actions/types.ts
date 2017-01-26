export type ActionType = AddContainer
    | RemoveContainer
    | AddHost
    | RemoveHost
    | AddConfiguration

export interface AddContainer {
    type: 'add-container';
    container: Concierge.APIContainer;
}

export interface RemoveContainer {
    type: 'remove-container';
    id: number;
}

export interface AddHost {
    type: 'add-host';
    host: Concierge.APIHost;
}

export interface RemoveHost {
    type: 'remove-host';
    id: number;
}

export interface AddConfiguration {
    type: 'add-configuration';
    configuration: Concierge.Configuration;
}
