import { RequestHandler } from 'express'
import * as getConcierges from '../../concierges/get'

const handler: RequestHandler = async (req, res) => {
  const concierges = await getConcierges.all()
  res.json(concierges)
}

export default handler