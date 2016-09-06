import getContainerInfo from '../containers/getInfo';
import server from './server';
import * as getContainers from '../containers/get';
import createContainer from '../containers/create';
import * as Boom from 'boom';
import * as getHosts from '../hosts/get';
import saveAll from '../containers/saveAll';
import getVolume from '../containers/getVolume';
import fork from '../containers/fork';
import stop from '../containers/stop';
import start from '../containers/start';
import remove from '../containers/remove';
import change from '../containers/change';
import getLog from '../containers/getLog';
import getStats from '../containers/getStats';

var get = {
	method: 'GET',
	path: '/containers',
	handler: (request, reply) => {
		getContainers.all()
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var getVolumeRoute = {
	method: 'GET',
	path: '/containers/{id}/volume',
	handler: async((request, reply) => {
		const container = await(getContainers.one(request.params.id));		
		const filename = `${container.subdomain}_${container.applicationName}_${container.variant}.tar`;
		const volume = await(getVolume(container));

		reply(volume)
			.type('application/octet-stream')
			.header('Content-Disposition', 'attachment; filename=' + filename)
			.header('Content-Description', 'File Transfer');
	})
}

var create = {
	method: 'PUT',
	path: '/containers',
	handler: (request, reply) => {
		createContainer(request.payload, null)
			.then(reply)
			.catch(error => {
				reply(Boom.expectationFailed(error));
				throw error;
			});
	}
}

var post = {
	method: 'POST',
	path: '/containers',
	handler: (request, reply) => {
		saveAll(request.payload)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var forkRoute = {
	method: 'PUT',
	path: '/containers/{id}/fork',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then((container: Concierge.Container) => fork(container, request.payload))
			.then(() => reply('Successlly created container'))
			.catch(error => reply(Boom.expectationFailed('Failed: ' + error)));
	}
}

var containerInfo = {
	method: 'GET',
	path: '/containers/{id}/info',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then(getContainerInfo)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var stopRoute = {
	method: 'POST',
	path: '/containers/{id}/stop',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then(stop)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var startRoute = {
	method: 'POST',
	path: '/containers/{id}/start',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then(start)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var removeRoute = {
	method: 'DELETE',
	path: '/containers/{id}',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then((container: Concierge.Container) => remove(container, true))
			.then(() => reply('Successfully deleted container'))
			.catch(error => {
				reply(Boom.expectationFailed(error));
				throw error;
			});
	}
}

var changeRoute = {
	method: 'PUT',
	path: '/containers/{id}/change',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then((container: Concierge.Container) => change(container, request.payload))
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

var logRoute = {
	method: 'GET',
	path: '/containers/{id}/log',
	handler: (request, reply) => {
		getContainers.one(request.params.id)
			.then(getLog)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
} 

var statsRoute = {
    method: 'GET',
    path: '/containers/{id}/stats',
    handler: (request, reply) => {
        getContainers.one(request.params.id)
            .then(getStats)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));
    }
}

server.route(get);
server.route(getVolumeRoute);
server.route(create);
server.route(containerInfo);
server.route(post);
server.route(forkRoute);
server.route(stopRoute);
server.route(startRoute);
server.route(removeRoute);
server.route(changeRoute);
server.route(logRoute);
server.route(statsRoute);