import * as Actions from './types';
import Container = Concierge.APIContainer;
import Host = Concierge.APIHost;

export function addContainer(container: Container): Actions.AddContainer {
    return {
        container,
        kind: 'add-container'
    }
}

export function removeContainer(id: number): Actions.RemoveContainer {
    return {
        id,
        kind: 'remove-container'
    }
}

export function addHost(host: Host): Actions.AddHost {
    return {
        host,
        kind: 'add-host'
    }
}

export function removeHost(id: number): Actions.RemoveHost {
    return {
        id,
        kind: 'remove-host'
    }
}