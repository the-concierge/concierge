import { RequestHandler } from 'express'
import * as get from '../../containers/get'
import change from '../../containers/change'

const handler: RequestHandler = async(req, res) => {
  const container = await get.one(req.params.id)
  const result = await change(container, req.body)
  res.json(result)
}

export default handler