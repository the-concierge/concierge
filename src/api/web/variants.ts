import server from './server';
import * as get from '../variants/get';
import deploy from '../variants/deploy';
import saveAll from '../variants/saveAll';
import * as Boom from 'boom';
import * as log from '../../logger';
import getDeployed from '../variants/getDeployed';
import deleteVariant from '../variants/delete';

var getVariants = {
	method: 'GET',
	path: '/variants',
	handler: (request, reply) => {
		get.all()
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
};

var getDeployedVariants = {
	method: 'GET',
	path: '/variants/deployed',
	handler: (request, reply) => {
		var variantName = null;
		getDeployed()
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
};

var getDeployedVariantsByApplication = {
	method: 'GET',
	path: '/variants/{id}/deployed',
	handler: (request, reply) => {
		var variantName = null;
		getDeployed(request.params.id)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var saveAllRoute = {
	method: 'POST',
	path: '/variants',
	handler: (request, reply) => {
		saveAll(request.payload)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var deleteRoute = {
	method: 'DELETE',
	path: '/variants/{name}',
	handler: (request, reply) => {
		var name = request.params.name;
		deleteVariant(name)
			.then(() => {
				log.info(`Deleted image '${name}' from registry`);
				reply(true);
			})
			.catch(error => {
				reply(Boom.forbidden(error))
			});
	}
}

server.route(getVariants);
server.route(getDeployedVariants);
server.route(saveAllRoute);
server.route(deleteRoute);
server.route(getDeployedVariantsByApplication);