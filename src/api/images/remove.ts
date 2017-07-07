import docker from '../docker'
import { RequestHandler } from 'express'
import * as db from '../hosts/db'

const handler: RequestHandler = async (req, res) => {
  const hosts = await db.getAll()
  const tag = req.query.tag
  if (!tag) {
    res
      .status(400)
      .json({ message: 'No tag provided' })
    return
  }

  for (const host of hosts) {
    const client = docker(host)
    const image = client.getImage(tag)
    try {
      await image.remove()
    } catch (ex) {
      // Intentional NOOP
      // The image may not exist on the host
    }
  }

  res.json({ message: 'Successfully removed image' })
}

export default handler