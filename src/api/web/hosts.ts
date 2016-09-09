import * as getHosts from '../hosts/get';
import saveAll from '../hosts/saveAll';
import server from './server';
import getContainers from '../hosts/getContainers';
import * as Boom from 'boom';

const REDACT = '********'
var get = {
    method: 'GET',
    path: '/api/hosts',
    handler: async((request, reply) => {
        try {
            const hosts = await(getHosts.all());
            hosts.forEach(host => host.privateKey = REDACT);
            reply(hosts);
        }
        catch (error) {
            reply(Boom.expectationFailed(error));
            throw error;
        }
    })
}

var getOne = {
    method: 'GET',
    path:'/api/hosts/{id}',
    handler: async((request, reply) => {
        const host = await(getHosts.one(request.params.id as number));
        host.privateKey = REDACT;
        reply(host);
    })
}

var updateHosts = {
    method: 'POST',
    path: '/api/hosts',
    handler: (request, reply) => {
        saveAll(request.payload)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));
    }
}

var getContainersRoute = {
    method: 'GET',
    path: '/api/hosts/{id}/containers',
    handler: (request, reply) => {
        var id = request.params.id as number
         || null;

        getContainers(id)
            .then(reply)
            .catch(error => reply(Boom.expectationFailed(error)));
    }
}

server.route(getContainersRoute);
server.route(get);
server.route(updateHosts);
server.route(getOne);