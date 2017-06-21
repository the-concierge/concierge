import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const hostname = req.body.hostname || ''
  const dockerPort = req.body.dockerPort || 2375
  const sshPort = req.body.sshPort || 22
  const capacity = req.body.capacity || 5
  const privateKey = req.body.privateKey || ''
  const sshUsername = req.body.sshUsername || ''

  if (!hostname.length) {
    res
      .status(400)
      .json({ message: 'Invalid hostname provided' })
    return
  }

  if (!sshUsername.length) {
    res
      .status(400)
      .json({ message: 'Invalid SSH username provided' })
    return
  }

  const body = { hostname, dockerPort, sshPort, capacity, sshUsername }

  try {
    const result: number[] = await db.hosts()
      .insert({ ...body, privateKey })
    res.json({ ...body, id: result[0] })
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler