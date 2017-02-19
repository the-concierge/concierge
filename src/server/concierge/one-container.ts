import { RequestHandler } from 'express'
import * as getContainers from '../../concierges/getContainers'

const handler: RequestHandler = async (req, res) => {
  const container = await getContainers.one(req.params.id)
  res.json(container)
}

export default handler