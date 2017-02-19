import { RequestHandler } from 'express'
import getStats from '../../containers/getStats'
import * as get from '../../containers/get'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const stats = await getStats(container)
  res.json(stats)
}

export default handler