import { RequestHandler } from 'express'
import validate from './validate'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const { repository, name, key, label, dockerfile } = req.body

  const id = req.params.id
  const body = { repository, name, key, label, dockerfile }
  const errors = validate(body)

  if (errors.length) {
    res.status(400).json(errors)
    return
  }

  try {
    await db.applications()
      .update(body)
      .where('id', id)
    res.json({ id, ...body })
  } catch (ex) {
    res
      .status(500)
      .json({ message: ex.message || ex })
  }
}

export default handler