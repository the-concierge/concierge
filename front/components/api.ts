import {ContainerInfo} from 'dockerode-ts';

export async function getHosts(): Promise<Concierge.APIHost[]> {    
    return fetch('/hosts')
        .then(json);
}

export function getHost(id: number): Promise<Concierge.APIHost[]> {
    return fetch(`/hosts/${id}`)
        .then(json);
}

export function getContainers(): Promise<ContainerInfo[]> {
    return fetch('/containers')
        .then(json);
}

export function getHostContrainers(hostId: number): Promise<ContainerInfo[]> {
    return fetch(`/hosts/${hostId}/containers`)
        .then(json);
}

const json = (r: Response) => r.json();