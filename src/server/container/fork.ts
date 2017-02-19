import { RequestHandler } from 'express'
import fork from '../../containers/fork'
import * as get from '../../containers/get'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const newContainer = await fork(container, req.body)
  res.json(newContainer)
}

export default handler