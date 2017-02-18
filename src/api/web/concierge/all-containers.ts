import { RequestHandler } from 'express'
import * as getContainers from '../../concierges/getContainers'

const handler: RequestHandler = async (req, res) => {
  const containers = await getContainers.all()
  res.json(containers)
}

export default handler