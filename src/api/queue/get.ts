import { RequestHandler } from 'express'
import { getQueue } from '../applications/monitor/api'

const handler: RequestHandler = (_req, res) => {
  const queue = getQueue()
  res.json(queue)
}

export default handler
