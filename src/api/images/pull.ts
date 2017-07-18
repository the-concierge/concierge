import { RequestHandler } from 'express'
import * as db from '../hosts/db'
import docker from '../docker'

const handler: RequestHandler = async (req, res) => {
  const imageName = req.query.imageName
  const tag = req.query.tag

  const hosts = await db.getAll()
  if (hosts.length === 0) {
    return res
      .status(412)
      .json({ message: 'No hosts are available to service this request' })
  }

  if (typeof imageName !== 'string' || typeof tag !== 'string') {
    return res
      .status(400)
      .json({ message: 'Invalid image name or tag' })
  }

  const client = docker(hosts[0])

  try {
    await client.pull(`${imageName}:${tag}`, {})
    return res.json({ message: 'Pulling image' })
  } catch (ex) {
    return res
      .status(500)
      .json({ message: ex.message || ex })
  }
}

export default handler