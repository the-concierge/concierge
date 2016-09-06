import dockerClient from '../dockerClient';
import { posix } from 'path';
import getRegistry from '../registry/getRegistry';
import hasImage from '../hosts/hasImage';
import pullVariant from '../hosts/pullVariant';
import getVolumePath from '../hosts/volumePath';
import getConfig from '../configurations/get';
import getVolumes from '../variants/getVolumes';
import * as Docker from 'dockerode-ts';

/**
 * Create a new container and return the Docker ID of the new container
 */
export default async((container: Concierge.Container, host: Concierge.Host): string => {
    container.host = host.hostname;

    // Pull the image 'to the Host' from the registry if the Host doesn't have the image 
    let imageExists = await(hasImage(host, container.dockerImage));
    if (!imageExists) {
        await(pullVariant(host, container.dockerImage));
    }
    let containerOptions = await(newContainerOptions(host, container));
    let newContainerDockerId = await(runContainer(host, container, containerOptions));
    return newContainerDockerId;
});

function runContainer(host: Concierge.Host, container: Concierge.Container, options: Docker.ContainerCreateOptions) {

    var promise = new Promise<string>((resolve, reject) => {
        var client = dockerClient(host);
        var startHandler = (error, data, newDockerId: string) => {
            if (error) return reject(error);
            resolve(newDockerId);
        }

        var createHandler = (error, dockerContainer: Docker.Container) => {
            if (error) return reject('[Container:Run] ' + error);
            dockerContainer.start((error, data) => startHandler(error, data, dockerContainer.id));
        }

        client.createContainer(options, createHandler);
    });

    return promise;
}

const newContainerOptions = async((host: Concierge.Host, container: Concierge.Container) => {
    const config = getConfig();
    const hostPath = posix.join(
        getVolumePath(host),
        container.subdomain
    );
    try {
        const volumes = await(getVolumes(host, container.dockerImage));
        const binds: string[] = volumes.map(volume => `${posix.join(hostPath, volume)}:${volume}`);

        // Inject Concierge specific environment variables
        // TODO: This feature should be documented clearly
        const variables = [
            `CONCIERGE_SUBDOMAIN=${container.subdomain}`,
            `CONCIERGE_LABEL=${container.label}`
        ];
        
        const existingVariables: string[] = JSON.parse(container.variables);

        const options: Docker.ContainerCreateOptions = {
            Image: container.dockerImage,
            HostConfig: {
                Binds: binds,
                PublishAllPorts: true, // Eliminates port assigning race conditions
                RestartPolicy: {
                    Name: 'on-failure',
                    MaximumRetryCount: Number(config.containerMaximumRetries)
                }
            },
            Env: variables.concat(existingVariables)
        };

        return options;
    } 
    catch (ex) {
        throw ex;
    }

});
