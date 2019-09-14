import * as path from 'path'
import * as fs from 'fs'
import { RequestHandler } from 'express'
import * as db from './db'

const handler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  const app = await db.one(id)
  if (!app) {
    res.status(400).json({ message: `Application '${id}' does not exist` })
    return
  }

  try {
    const files = await getLogs(app)
    res.json(files)
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}
export default handler

const logFileBase = path.resolve(__dirname, '../../../logs')
function getLogs(application: Schema.Application) {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(path.resolve(logFileBase, application.id.toString()), (err, files) => {
      if (err) {
        return reject(err)
      }

      resolve(files.filter(file => file.endsWith('.json')))
    })
  })
}
