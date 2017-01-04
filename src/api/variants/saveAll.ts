import db from '../../data/connection';
import * as states from '../../types/states';
import DeployedState = states.DeployedState;

export default function saveAll(request: Concierge.SaveRequest<Concierge.Variant>) {

	var canProceed = request.deletes.every(del => isDeletable(del));
	if (!canProceed) return Promise.reject('Only "Failed" variants can be deleted');

	return db.transaction(trx => {
		doDeletes(trx, request.updates)
			.then(trx.commit)
			.catch(error => {
				trx.rollback();
				return Promise.reject(error);
			});
	});
}

async function doDeletes(trx: any, models: Concierge.Variant[]) {
	for (const model of models) {
		await db('Containers')
			.update(model)
			.where({ name: model.name })
			.transacting(trx)
	}
}

function isDeletable(model: Concierge.Variant) {
	const states = [
		DeployedState[DeployedState.Failed]
	];

	const isAllowed = states.some(state => model.buildState === state);
	return isAllowed;
}