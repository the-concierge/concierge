import getDockerClient from '../dockerClient';
import * as getHosts from './get';

export default function getContainers(host?: Concierge.Host) {
    if (host) return getContainersForHost(host);

    return getHosts.all()
        .then((hosts: Concierge.Host[]) => {
            var requests = hosts.map(toRequest);
            return Promise.all(requests);
        })
        .then((results: any[]) => {
            var containers = results.reduce((prev, curr) => prev.concat(curr), []);
            return Promise.resolve(containers);
        });
}

function getContainersForHost(host: Concierge.Host) {
    var promise = new Promise((resolve, reject) => {

        var handler = (error, containers) => {
            if (error) return reject(error);
            resolve(containers);
        }
        setTimeout(() => reject('Connection to docker host timed out'), 750);
        getDockerClient(host)
            .listContainers({ all: 1 }, handler);
    })
        .catch(err => []);
    return promise;
}


function toRequest(host: Concierge.Host) {
    return getContainersForHost(host);
}