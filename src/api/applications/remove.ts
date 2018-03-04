import { RequestHandler } from 'express'
import * as get from './db'
import removeRepo from '../git/remove'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id
  const app = await get.one(id)
  if (!app) {
    res.status(400).json({ message: `Application '${id}' does not exist` })
    return
  }

  await removeRepo(app)
  await get.remove(id)

  res.json({ message: `Successfully removed application '${id}'` })
}

export default handler
