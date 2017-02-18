import * as Boom from 'boom'
import server from './server'
import * as getConcierges from '../concierges/get'
import * as getContainers from '../concierges/getContainers'
import cloneContainer from '../concierges/clone'
import saveAll from '../concierges/saveAll'

let getRoute = {
  path: '/api/concierges',
  method: 'GET',
  handler: (request, reply) => {
    getConcierges.all()
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let containerRoute = {
  path: '/api/concierges/containers/{id?}',
  method: 'GET',
  handler: (request, reply) => {
    let id = request.params.id
      ? Number(request.params.id)
      : null

    getContainers.one(id)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let cloneRoute = {
  path: '/api/concierges/clone',
  method: 'POST',
  handler: (request, reply) => {
    cloneContainer(request.payload)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let saveAllRoute = {
  path: '/api/concierges',
  method: 'POST',
  handler: (request, reply) => {
    saveAll(request.payload)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

server.route(getRoute)
server.route(containerRoute)
server.route(cloneRoute)
server.route(saveAllRoute)