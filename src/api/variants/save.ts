import db from '../../data/connection';
import * as states from '../../types/states';
import DeployedState = states.DeployedState;
import * as log from '../../logger';

export default async function save(applicationId: number, tag: string, buildState?: DeployedState): Promise<boolean> {
	buildState = buildState || DeployedState.NotDeployed;

	const variant = {
		name: tag,
		application: applicationId,
		buildState: DeployedState[buildState],
		buildTime: Date.now()
	}

	try {
		await db('Variants')
			.insert(variant);
		return true;
	}
	catch (ex) {
		await db('Variants')
			.update(variant)
			.where('name', variant.name)
		return true;
	}
}
