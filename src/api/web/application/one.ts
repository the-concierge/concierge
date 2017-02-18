import { RequestHandler } from 'express'
import * as getApplications from '../../applications/get'
import { StatusError } from '../error'

const handler: RequestHandler = async (req, res, next) => {
  const app = await getApplications.one(req.params.id)

  if (!app) {
    return next(new StatusError('Application not found', 404))
  }

  app.gitPrivateKey = '********'
  app.gitPrivateToken = '********'
  res.json(app)
}

export default handler