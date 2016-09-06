import getDockerClient from '../dockerClient';
import * as getHost from '../hosts/get';
import * as Docker from 'dockerode-ts';

/**
 * Start a container (from a stopped state)
 */
export default function start(container: Concierge.Container) {
	return getHost.one(container.host)
		.then((host: Concierge.Host) => getDockerClient(host, 500))
		.then(client => client.getContainer(container.dockerId))
		.then(dockerContainer => startContainer(dockerContainer, container))
}

function startContainer(dockerContainer: Docker.Container, container: Concierge.Container) {
	var promise = new Promise((resolve, reject) => {
		dockerContainer.start((error, response) => {
			if (error) return reject('[START]: ' + error);
			resolve(response);
		});
	});
	
	return promise;
}
