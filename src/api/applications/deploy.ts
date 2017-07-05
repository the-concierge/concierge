import * as db from './db'
import { RequestHandler } from 'express'
import build from './build'

const handler: RequestHandler = async (req, res) => {
  const { id, ref, tag } = req.params as { id: number, ref: string, tag: string }
  const app = await db.one(id)

  if (!app) {
    res
      .status(400)
      .json({ message: `Application '${id}' does not exist` })
    return
  }

  build(app, ref, tag)
  res.json({ message: `Attempting to build image '${tag}'` })
}

export default handler