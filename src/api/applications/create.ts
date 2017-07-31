import { RequestHandler } from 'express'
import validate from './validate'
import clone from '../git/clone'
import * as db from '../../data'

type Body = {
  name: string
  label: string
  repository: string
  username: string
  key: string
  dockerfile: string
}

const handler: RequestHandler = async (req, res) => {
  const { repository, name, key, label, dockerfile, username } = req.query as Body

  const body = { repository, name, key, label, dockerfile, username }
  const errors = validate(body)

  if (errors.length) {
    const message = errors.join(', ')
    res.status(400).json({ message })
    return
  }

  try {
    const result: number[] = await db.applications()
      .insert(body)
    const id = result[0]

    const app = { ...body, id }

    res.json(app)
    clone(app)
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler