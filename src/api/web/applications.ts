import * as Boom from 'boom';
import server from './server';
import * as getApplications from '../applications/get';
import * as httpRequest from '../request';
import saveAll from '../applications/saveAll';
import deploy from '../variants/deploy';

const getRoute = {
	path: '/applications',
	method: 'GET',
	handler: async((request, reply) => {
		const apps = await(getApplications.all());
		apps.forEach(app => {
			app.gitPrivateKey = '********';
			app.gitPrivateToken = '********';
		});
		reply(apps);		
	})
}

const saveAllRoute = {
	path: '/applications',
	method: 'POST',
	handler: (request, reply) => {
		saveAll(request.payload)
			.then(reply)
			.catch(error => reply(Boom.expectationFailed(error)));
	}
}

const deployRoute = {
    path: '/applications/{id}/deploy/{tag}',
    method: 'POST',
    handler: async((request, reply) => {
        const id = request.params.id;
        const tag = request.params.tag;
        const app = await(getApplications.one(id));

        deploy(app, tag)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));

    })
}

server.route(getRoute);
server.route(saveAllRoute);
server.route(deployRoute);