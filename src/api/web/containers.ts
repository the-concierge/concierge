import getContainerInfo from '../containers/getInfo'
import server from './server'
import * as getContainers from '../containers/get'
import createContainer from '../containers/create'
import * as Boom from 'boom'
import saveAll from '../containers/saveAll'
import getVolume from '../containers/getVolume'
import fork from '../containers/fork'
import stop from '../containers/stop'
import start from '../containers/start'
import remove from '../containers/remove'
import change from '../containers/change'
import getLog from '../containers/getLog'
import getStats from '../containers/getStats'

const get = {
  method: 'GET',
  path: '/api/containers',
  handler: (request, reply) => {
    getContainers.all()
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const getVolumeRoute = {
  method: 'GET',
  path: '/api/containers/{id}/volume',
  handler: async function handler(request, reply) {
    const container = await getContainers.one(request.params.id)
    const filename = `${container.subdomain}_${container.applicationName}_${container.variant}.tar`
    const volume = await getVolume(container)
    reply(volume)
      .type('application/octet-stream')
      .header('Content-Disposition', 'attachment; filename=' + filename)
      .header('Content-Description', 'File Transfer')
  }
}

const create = {
  method: 'PUT',
  path: '/api/containers',
  handler: (request, reply) => {
    createContainer(request.payload, null)
      .then(reply)
      .catch(error => {
        reply(Boom.expectationFailed(error))
        throw error
      })
  }
}

const post = {
  method: 'POST',
  path: '/api/containers',
  handler: (request, reply) => {
    saveAll(request.payload)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const forkRoute = {
  method: 'PUT',
  path: '/api/containers/{id}/fork',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then((container: Concierge.Container) => fork(container, request.payload))
      .then(() => reply('Successlly created container'))
      .catch(error => reply(Boom.expectationFailed('Failed: ' + error)))
  }
}

const containerInfo = {
  method: 'GET',
  path: '/api/containers/{id}/info',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then(getContainerInfo)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const stopRoute = {
  method: 'POST',
  path: '/api/containers/{id}/stop',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then(stop)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const startRoute = {
  method: 'POST',
  path: '/api/containers/{id}/start',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then(start)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const removeRoute = {
  method: 'DELETE',
  path: '/api/containers/{id}',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then((container: Concierge.Container) => remove(container, true))
      .then(() => reply('Successfully deleted container'))
      .catch(error => {
        reply(Boom.expectationFailed(error))
        throw error
      })
  }
}

const changeRoute = {
  method: 'PUT',
  path: '/api/containers/{id}/change',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then((container: Concierge.Container) => change(container, request.payload))
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const logRoute = {
  method: 'GET',
  path: '/api/containers/{id}/log',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then(getLog)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

const statsRoute = {
  method: 'GET',
  path: '/api/containers/{id}/stats',
  handler: (request, reply) => {
    getContainers.one(request.params.id)
      .then(getStats)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

server.route(get)
server.route(getVolumeRoute)
server.route(create)
server.route(containerInfo)
server.route(post)
server.route(forkRoute)
server.route(stopRoute)
server.route(startRoute)
server.route(removeRoute)
server.route(changeRoute)
server.route(logRoute)
server.route(statsRoute)