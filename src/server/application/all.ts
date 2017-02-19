import { RequestHandler } from 'express'
import * as getApplications from '../../applications/get'

const handler: RequestHandler = async (req, res) => {
  const apps = await getApplications.all()
  apps.forEach(app => {
    app.gitPrivateKey = '********'
    app.gitPrivateToken = '********'
  })
  res.json(apps)
}

export default handler