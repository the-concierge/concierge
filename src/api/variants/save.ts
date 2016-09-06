import db from '../../data/connection';
import * as states from '../../types/states';
import DeployedState = states.DeployedState;
import * as log from '../../logger';


export default function save(applicationId: number, tag: string, buildState?: DeployedState): Promise<boolean> {
	return _save(applicationId, tag, buildState);
}

const _save = async((applicationId: number, tag: string, buildState: DeployedState) => {
	buildState = buildState || DeployedState.NotDeployed;

	const variant = {
		name: tag,
		application: applicationId,
		buildState: DeployedState[buildState],
		buildTime: Date.now()
	}

	try {
		await(
			db('Variants')
				.insert(variant)
		)[0];
		return true;
	}
	catch (ex) {
		await(
			db('Variants')
				.update(variant)
				.where('name', variant.name)
		)
		return true;
	}
})