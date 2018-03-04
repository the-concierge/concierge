import { RequestHandler } from 'express'
import * as db from '../../data'

type Body = {
  name: string
  username: string
  key: string
}

const handler: RequestHandler = async (req, res) => {
  const { name = '', username = '', key = '' } = req.body as Body

  if (!name.length) {
    res.status(400).json({ message: 'Must provide a name' })
  }

  const body = { name, username, key }

  try {
    await db.credentials().insert(body)

    const app = { ...body }
    delete app.key

    res.json(app)
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler
