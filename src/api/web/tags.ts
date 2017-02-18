import server from './server'
import * as Boom from 'boom'
import getTags from '../applications/tags'
import { one as getApp } from '../applications/get'

const getRemotesRoute = {
  method: 'GET',
  path: '/api/tags/remote/{id}',
  handler: async function (request, reply) {
    try {
      const app = await getApp(request.params.id)
      const tags = await getTags(app)
      reply(tags)
    } catch (ex) {
      reply(Boom.expectationFailed(ex))
    }
  }
}

server.route(getRemotesRoute)