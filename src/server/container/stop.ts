import start from '../../containers/stop'
import * as get from '../../containers/get'

import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const success = await start(container)
  res.json({ success })
}

export default handler