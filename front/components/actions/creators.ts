import ActionTypes, * as Actions from './types';
import Container = Concierge.APIContainer;
import Host = Concierge.APIHost;

export function addContainer(container: Container): Actions.AddContainer {
    return {
        container,
        kind: ActionTypes.AddContainer
    }
}

export function removeContainer(id: number): Actions.RemoveContainer {
    return {
        id,
        kind: ActionTypes.RemoveContainer
    }
}

export function addHost(host: Host): Actions.AddHost {
    return {
        host,
        kind: ActionTypes.AddHost
    }
}

export function removeHost(id: number): Actions.RemoveHost {
    return {
        id,
        kind: ActionTypes.RemoveHost
    }
}