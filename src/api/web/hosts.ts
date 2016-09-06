import * as getHosts from '../hosts/get';
import saveAll from '../hosts/saveAll';
import server from './server';
import getContainers from '../hosts/getContainers';
import * as Boom from 'boom';

var get = {
    method: 'GET',
    path: '/hosts',
    handler: async((request, reply) => {
        try {
            const hosts = await(getHosts.all());
            hosts.forEach(host => host.privateKey = '**********');
            reply(hosts);
        }
        catch (error) {
            reply(Boom.expectationFailed(error));
            throw error;
        }
    })
}

var updateHosts = {
    method: 'POST',
    path: '/hosts',
    handler: (request, reply) => {
        saveAll(request.payload)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));
    }
}

var getContainersRoute = {
    method: 'GET',
    path: '/hosts/containers/{hostName?}',
    handler: (request, reply) => {
        var hostName = request.params.hostName || null;

        getContainers(hostName)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));
    }
}

server.route(getContainersRoute);
server.route(get);
server.route(updateHosts);