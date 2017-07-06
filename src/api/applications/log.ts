import * as path from 'path'
import * as fs from 'fs'
import { RequestHandler } from 'express'

const logFileBase = path.resolve(__dirname, '../../../logs')

const handler: RequestHandler = async (req, res) => {
  const { id, filename } = req.params
  const logFilename = path.resolve(logFileBase, id.toString(), filename)

  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.setHeader('Content-Type', 'binary/octet-stream')

  fs.createReadStream(logFilename).pipe(res)
}
export default handler
