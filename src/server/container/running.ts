import { RequestHandler } from 'express'
import * as get from '../../containers/getRunning'

const handler: RequestHandler = async (req, res) => {
  const containers = await get.getAllRunning()
  res.json(containers)
}

export default handler