import { RequestHandler } from 'express'
import { get } from './db'

const handler: RequestHandler = async (_, res) => {
  try {
    const config = await get()
    res.json(config)
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
