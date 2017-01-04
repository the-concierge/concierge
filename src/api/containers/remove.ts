import db from '../../data/connection';
import getDockerClient from '../dockerClient';
import * as getHost from '../hosts/get';
import archiveVolume from './archiveVolume';
import stopContainer from './stop';

export default function remove(container: Concierge.Container, deleteFromDatabase?: boolean) {
	return _remove(container, deleteFromDatabase);
}

async function _remove(container: Concierge.Container, deleteFromDb: boolean) {
	deleteFromDb = deleteFromDb || false;

	await stopContainer(container);
	await archiveVolume(container);
	const host = await (getHost.one(container.host));
	const client = getDockerClient(host);
	await removeContainer(container, client);
	await deleteFromDatabase(container, deleteFromDb);
	return true;
}

function removeContainer(container: Concierge.Container, client: any) {
	var dockerContainer = client.getContainer(container.dockerId);

	var promise = new Promise<boolean>((resolve, reject) => {
		dockerContainer.remove({
			'v': 1 // Remove the volumes associated with the container
		}, (error, response) => {
			if (error) return reject('[DELCONTAINER]: ' + error);
			resolve(true);
		});
	});

	return promise;
}

function deleteFromDatabase(container: Concierge.Container, deleteFromDb: boolean): Promise<any> {
	if (!deleteFromDb) return Promise.resolve(true);
	return db('Containers')
		.delete()
		.where({ id: container.id })
}