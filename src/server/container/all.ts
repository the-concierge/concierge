import { RequestHandler } from 'express'
import * as get from '../../containers/get'

const handler: RequestHandler = async (req, res) => {
  const containers = await get.all()
  res.json(containers)
}

export default handler