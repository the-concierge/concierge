import * as getHosts from '../hosts/get'
import saveAll from '../hosts/saveAll'
import server from './server'
import getContainers from '../hosts/getContainers'
import * as Boom from 'boom'

const REDACT = '********'
const get = {
  method: 'GET',
  path: '/api/hosts',
  handler: async function (request, reply) {
    try {
      const hosts = await getHosts.all()
      hosts.forEach(host => host.privateKey = REDACT)
      reply(hosts)
    } catch (error) {
      reply(Boom.expectationFailed(error))
      throw error
    }
  }
}

const getOne = {
  method: 'GET',
  path: '/api/hosts/{id}',
  handler: async function (request, reply) {
    const host = await getHosts.one(request.params.id as number)
    host.privateKey = REDACT
    reply(host)
  }
}

const updateHosts = {
  method: 'POST',
  path: '/api/hosts',
  handler: (request, reply) => {
    saveAll(request.payload)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const getContainersRoute = {
  method: 'GET',
  path: '/api/hosts/{id}/containers',
  handler: (request, reply) => {
    let id = request.params.id as number
      || null

    getContainers(id)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

server.route(getContainersRoute)
server.route(get)
server.route(updateHosts)
server.route(getOne)