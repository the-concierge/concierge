import { RequestHandler } from 'express'
import * as getConcierges from '../../concierges/get'

const handler: RequestHandler = async (req, res) => {
  const concierge = await getConcierges.one(req.params.id)
  res.json(concierge)
}

export default handler