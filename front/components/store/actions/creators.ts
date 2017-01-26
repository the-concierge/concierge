import * as Actions from './types';
import Container = Concierge.APIContainer;
import Host = Concierge.APIHost;
import Configuration = Concierge.Configuration;

export function addContainer(container: Container): Actions.AddContainer {
    return {
        container,
        type: 'add-container'
    }
}

export function removeContainer(id: number): Actions.RemoveContainer {
    return {
        id,
        type: 'remove-container'
    }
}

export function addHost(host: Host): Actions.AddHost {
    return {
        host,
        type: 'add-host'
    }
}

export function removeHost(id: number): Actions.RemoveHost {
    return {
        id,
        type: 'remove-host'
    }
}

export function addConfiguration(configuration: Configuration) {
    return {
        configuration,
        type: 'add-configuration'
    }
}