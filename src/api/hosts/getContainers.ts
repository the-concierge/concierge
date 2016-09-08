import { ContainerInfo } from 'dockerode-ts'
import getDockerClient from '../dockerClient';
import * as getHosts from './get';

export default async function getContainers(id?: number) {
    if (id) return getContainersForHost(await getHosts.one(id));

    const hosts = await getHosts.all();
    const allInfo = await Promise.all(hosts.map(getContainersForHost));
    const infos = allInfo.reduce<ContainerInfo[]>((list, info: ContainerInfo[]) => list.concat(info), []);
    return infos;
}

function getContainersForHost(host: Concierge.Host) {
    const promise = new Promise<ContainerInfo[]>((resolve, reject) => {
        const handler = (error, containers: ContainerInfo[]) => {
            if (error) return reject(error);
            resolve(containers);
        }

        setTimeout(() => reject('Connection to docker host timed out'), 1500);

        getDockerClient(host)
            .listContainers({ all: 1 }, handler);
    });
    return promise;
}
