import { RequestHandler } from 'express'
import { update } from './db'

const handler: RequestHandler = async (req, res) => {
  const body = req.body as Partial<Concierge.Configuration>

  try {
    await update(body)
    res.json({ messsage: 'Successfully updated configuration' })
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
