import * as Actions from './types';
import Container = Concierge.APIContainer;
import Host = Concierge.APIHost;

export function addContainer(container: Container): Actions.AddContainer {
    return {
        container,
        kind: Actions.ADD_CONTAINER
    }
}

export function removeContainer(id: number): Actions.RemoveContainer {
    return {
        id,
        kind: Actions.REMOVE_CONTAINER
    }
}

export function addHost(host: Host): Actions.AddHost {
    return {
        host,
        kind: Actions.ADD_HOST
    }
}

export function removeHost(id: number): Actions.RemoveHost {
    return {
        id,
        kind: Actions.REMOVE_HOST
    }
}