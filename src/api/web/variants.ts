import server from './server'
import * as get from '../variants/get'
import saveAll from '../variants/saveAll'
import * as Boom from 'boom'
import * as log from '../../logger'
import getDeployed from '../variants/getDeployed'
import deleteVariant from '../variants/delete'

let getVariants = {
  method: 'GET',
  path: '/api/variants',
  handler: (request, reply) => {
    get.all()
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let getDeployedVariants = {
  method: 'GET',
  path: '/api/variants/deployed',
  handler: (request, reply) => {
    getDeployed()
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let getDeployedVariantsByApplication = {
  method: 'GET',
  path: '/api/variants/{id}/deployed',
  handler: (request, reply) => {
    getDeployed(request.params.id)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let saveAllRoute = {
  method: 'POST',
  path: '/api/variants',
  handler: (request, reply) => {
    saveAll(request.payload)
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let deleteRoute = {
  method: 'DELETE',
  path: '/api/variants/{name}',
  handler: (request, reply) => {
    let name = request.params.name
    deleteVariant(name)
      .then(() => {
        log.info(`Deleted image '${name}' from registry`)
        reply(true)
      })
      .catch(error => {
        reply(Boom.forbidden(error))
      })
  }
}

server.route(getVariants)
server.route(getDeployedVariants)
server.route(saveAllRoute)
server.route(deleteRoute)
server.route(getDeployedVariantsByApplication)