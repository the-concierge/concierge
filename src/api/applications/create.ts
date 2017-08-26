import { RequestHandler } from 'express'
import validate from './validate'
import clone from '../git/clone'
import * as fs from 'fs'
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
  const { repository, name, key, label, dockerfile, username } = req.body as Body

  const id = await getNextId()
  const body = { id, repository, name, key, label, dockerfile, username }
  const errors = validate(body)

  if (errors.length) {
    const message = errors.join(', ')
    res.status(400).json({ message })
    return
  }

  try {
    await db.applications()
      .insert(body)

    const app = { ...body }
    delete app.key

    res.json(body)
    clone(app)
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

function getNextId() {
  const dirs = new Promise<number>((resolve, reject) => {
    fs.readdir('repositories', (err, files) => {
      if (err) {
        return reject(err)
      }

      const ids = files
        .map(file => Number(file))
        .filter(id => !isNaN(id))

      const max = Math.max(...ids)
      resolve(max + 1)
    })
  })

  return dirs
}

export default handler