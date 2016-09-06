import dockerClient from '../dockerClient';
import * as getHost from '../hosts/get';
import DockerClient, { ContainerInspectInfo } from 'dockerode-ts'; 

/**
 * Retrieve inspect information of a Container (docker inspect [container_id]) 
 */
export default function get(container: Concierge.Container): Promise<ContainerInspectInfo> {
    return getHost.one(container.host)
        .then(dockerClient)
        .then(client => getContainerInfo(client, container));
}

function getContainerInfo(dockerClient: DockerClient, container: Concierge.Container) {
    var promise = new Promise<ContainerInspectInfo>((resolve, reject) => {

        var handler = (error, containerInfo: ContainerInspectInfo) => {
            if (error) return reject(error);
            resolve(containerInfo);
        }

        dockerClient.getContainer(container.dockerId)
            .inspect(handler);
    });

    return promise;
}
