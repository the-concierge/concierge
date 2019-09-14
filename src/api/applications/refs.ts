import getTags from '../git/tags'
import { RequestHandler } from 'express'
import * as get from './db'

const handler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  const app = await get.one(id)
  if (!app) {
    return res.status(404).json({ message: 'Not found' })
  }
  const tags = await getTags(app)
  return res.json(tags)
}

export default handler
