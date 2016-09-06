import server from './server';
import * as Boom from 'boom';
import getConfig from '../configurations/get';
import getTags from '../applications/tags';
import {one as getApp} from '../applications/get';

var getRemotesRoute = {
	method: 'GET',
	path: '/tags/remote/{id}',
	handler: async((request, reply) => {
		try {
			const app = await(getApp(request.params.id));			
			const tags = await(getTags(app));
			reply(tags);
		}
		catch (ex) {
			reply(Boom.expectationFailed(ex));
		}		
	})
};

server.route(getRemotesRoute);