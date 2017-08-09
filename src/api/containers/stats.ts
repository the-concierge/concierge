import { heartbeats } from '../../data'
import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
  const id: string = req.params.id
  const stats = await heartbeats()
    .select('cpu', 'memory', 'timestamp')
    .where('containerId', 'like', `${id}%`)

  res.json(stats)
}

export default handler