import { RequestHandler } from 'express'
import getLog from '../../containers/getLog'
import * as get from '../../containers/get'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const log = await getLog(container)
  res.json(log)
}

export default handler