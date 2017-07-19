import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id
  const hostname = req.body.hostname || ''
  const vanityHostname = req.body.vanityHostname || hostname || 'localhost'
  const dockerPort = req.body.dockerPort || 2375
  const sshPort = req.body.sshPort || 22
  const capacity = req.body.capacity || 5
  const privateKey = req.body.privateKey || ''
  const sshUsername = req.body.sshUsername || ''

  const hasHostname = !!hostname.length
  const hasUsername = !!sshUsername.length
  if (hasHostname && !hasUsername) {
    res
      .status(400)
      .json({ message: 'Invalid SSH username provided: Must provided credentials if providing a hostname' })
    return
  }

  const body = { hostname, dockerPort, sshPort, capacity, sshUsername, vanityHostname }

  try {
    const result: number[] = await db.hosts()
      .update({ ...body, privateKey })
      .where('id', id)
    res.json({ ...body, id: result[0] })
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler