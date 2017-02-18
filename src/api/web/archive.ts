import * as Boom from 'boom'
import server from './server'
import get from '../archive/get'
import getVolume from '../archive/getVolume'

let getRoute = {
  path: '/api/archive',
  method: 'GET',
  handler: (request, reply) => {
    get()
      .then(reply)
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

let getDbRoute = {
  path: '/api/archive/{volume}',
  method: 'GET',
  handler: (request, reply) => {
    const filename = request.params.volume
    getVolume(filename)
      .then(db => {
        reply(db)
          .type('application/octet-stream')
          .header('Content-Disposition', 'attachment; filename=' + filename)
          .header('Content-Description', 'File Transfer')
      })
      .catch(error => reply(Boom.expectationFailed(error)))
  }
}

server.route(getRoute)
server.route(getDbRoute)