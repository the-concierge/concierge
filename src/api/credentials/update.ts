import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const { name, username, key } = req.body

  const id = req.params.id
  const body = { name, username, key }

  // Do not update properties that are not in the request body
  if (username === undefined) {
    delete body.username
  }
  if (key === undefined) {
    delete body.key
  }
  if (name === undefined) {
    delete body.name
  }

  try {
    await db
      .credentials()
      .update(body)
      .where('id', id)
    delete body.key
    res.json({ id, ...body })
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
