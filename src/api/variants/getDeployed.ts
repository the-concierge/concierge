import db from '../../data/connection';
import * as states from '../../types/states';
import DeployedState = states.DeployedState;

/**
 * Get deployed Variants from the database
 */
export default function get(applicationId?: number) {
	var deployed = DeployedState[DeployedState.Deployed];
	const query = db('variants')
		.select()
		.where({ buildState: deployed });

	if (applicationId != null) {
		query.andWhere('application', applicationId)
	}

	return query;
}
