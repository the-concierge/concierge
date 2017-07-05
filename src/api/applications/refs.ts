import getTags from '../git/tags'
import { RequestHandler } from 'express'
import * as get from './db'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id
  const app = await get.one(id)
  const tags = await getTags(app)
  res.json(tags)
}

export default handler