import { RequestHandler } from 'express'
import validate from './validate'
import clone from '../git/clone'
import * as path from 'path'
import * as fs from 'fs'
import * as db from '../../data'

type Body = {
  name: string
  label: string
  repository: string
  username: string
  key: string
  dockerfile: string
  credentialsId: number
}

const handler: RequestHandler = async (req, res) => {
  const { repository, name, key, label, dockerfile, username, credentialsId = 0 } = req.body as Body

  const id = await getNextId()
  const body = { id, repository, name, key, label, dockerfile, username, credentialsId }

  if (credentialsId > 0) {
    body.username = ''
    body.key = ''
  }

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

    res.json(app)
    clone(app)
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

async function getNextId() {
  const apps: Array<{ id: number }> = await db.applications().select('id')
  const dirs = new Promise<number>((resolve, reject) => {
    const repoPath = path.resolve(__dirname, '../../..', 'repositories')
    fs.readdir(repoPath, (err, files) => {
      if (err) {
        return reject(err)
      }

      const ids = files
        .map(file => Number(file))
        .filter(id => !isNaN(id))

      const max = Math.max(...ids, ...apps.map(app => app.id))

      if (max < 1) {
        resolve(1)
        return
      }

      resolve(max + 1)
    })
  })

  return dirs
}

export default handler