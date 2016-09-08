import getContainerInfo from './getContainers';
import * as getContainers from '../containers/get';
import db from '../../data/connection';

/**
 * Get the current exposed ports for all Containers on all Hosts
 */
export default async(() => {
	const containers = await(getContainers.all());
	const containersInfo = await(getContainerInfo());
	const trx = await(db.getTransaction());

	try {
		const updateResults = containers.map(container => {
			const port = getPort(container, containersInfo);
			if (port == null) return null;

			return await(db('Containers')
				.update({ port })
				.where({ id: container.id })
				.transacting(trx))
		});
		await(trx.commit());
		return updateResults;
	}
	catch (ex) {
		await(trx.rollback());
		throw new Error(`Failed to updates ports: ${ex.message}`);
	}
});

function updatePorts(results: any[]) {
	const containers: Concierge.Container[] = results[0];

	const containersInfo: any[] = results[1];

}

function getPort(container: Concierge.Container, containersInfo: any[]) {

	var info = getInfo(containersInfo, container.dockerId);
	if (!info) return null;
	if (info.Ports.length === 0) return 0;
	return info.Ports[0].PublicPort;
}

function getInfo(info: any[], dockerId: string) {
	var matchingInfo = info.reduce((prev, curr) => {
		if (prev) return prev;

		var isMatch = dockerId === curr.Id;
		if (isMatch) prev = curr;
		return prev;
	}, null);
	return matchingInfo;
}