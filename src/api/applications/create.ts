import { RequestHandler } from 'express'
import validate from './validate'
import clone from '../git/clone'
import * as path from 'path'
import * as fs from 'fs'
import * as db from '../../data'
import { poll } from './monitor'
import { promisify } from 'util'

type Body = {
  name: string
  label: string
  repository: string
  username: string
  key: string
  dockerfile: string
  credentialsId: number
  autoBuild: boolean
}

const handler: RequestHandler = async (req, res) => {
  const {
    repository,
    name,
    key,
    label,
    dockerfile,
    username,
    autoBuild = false,
    credentialsId = 0
  } = req.body as Body

  const id = await getNextId()
  const body = { id, repository, name, key, label, dockerfile, username, credentialsId, autoBuild }

  if (credentialsId > 0) {
    body.username = ''
    body.key = ''
  }

  const errors = validate(body as any)

  if (errors.length) {
    const message = errors.join(', ')
    res.status(400).json({ message })
    return
  }

  try {
    await db.applications().insert(body)

    const app = { ...body }
    delete app.key

    await clone(app)
    res.json(app)

    // Once the application is ready and cloned, we will begin to track it
    poll()
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

async function getNextId() {
  const apps: Array<{ id: number }> = await db.applications().select('id')
  const dirs = await getRepoDirs()
  const ids = dirs.map(dir => Number(dir)).filter(id => !isNaN(id))
  const max = Math.max(...ids, ...apps.map(app => app.id))

  if (max < 1) {
    return 1
  }

  return max + 1
}

async function getRepoDirs() {
  const repoPath = path.resolve(__dirname, '../../..', 'repositories')
  try {
    const dirs = await readdir(repoPath)
    return dirs
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex
    }
    await mkdir(repoPath)
    const dirs = await readdir(repoPath)
    return dirs
  }
}

const readdir = promisify(fs.readdir)
const mkdir = promisify(fs.mkdir)

export default handler
