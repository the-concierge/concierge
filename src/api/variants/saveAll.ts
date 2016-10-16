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

const doDeletes = async((trx: any, models: Concierge.Variant[]) => {
	return models.map(model => await(
		db('Containers')
			.update(model)
			.where({ name: model.name })
			.transacting(trx)
	));
});

function isDeletable(model: Concierge.Variant) {
	var states = [
		DeployedState[DeployedState.Failed]
	];

	var isAllowed = states.some(state => model.buildState === state);
	return isAllowed;
}