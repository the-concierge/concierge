import { RequestHandler } from 'express'
import getInfo from '../../containers/getInfo'
import * as get from '../../containers/get'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const info = await getInfo(container)
  res.json(info)
}

export default handler