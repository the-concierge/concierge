import { RequestHandler } from 'express'
import { setConfig } from './db'

const handler: RequestHandler = async (req, res) => {
  const body: Partial<Concierge.Configuration> = req.body

  try {
    await setConfig(body)
    res.json({ messsage: 'Successfully updated configuration' })
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
