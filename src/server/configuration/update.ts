import { RequestHandler } from 'express'
import saveAll from '../../configurations/saveAll'

const handler: RequestHandler = async (req, res) => {
  const success = await saveAll(req.body)
  res.json({ success })
}

export default handler