import { RequestHandler } from 'express'
import saveAll from '../../hosts/saveAll'

const handler: RequestHandler = async (req, res) => {
  const success = await saveAll(req.body)
  res.json({ success })
}

export default handler