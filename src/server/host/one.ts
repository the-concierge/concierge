import { RequestHandler } from 'express'
import * as getHosts from '../../hosts/get'

const handler: RequestHandler = async (req, res) => {
  const host = await getHosts.one(req.params.id)
  host.privateKey = '********'
  res.json(host)
}

export default handler