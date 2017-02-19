import remove from '../../containers/remove'
import * as get from '../../containers/get'

import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const success = await remove(container)
  res.json({ success })
}

export default handler