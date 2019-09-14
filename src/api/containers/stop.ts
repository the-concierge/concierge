import { RequestHandler } from 'express'
import * as getHosts from '../hosts/db'
import docker from '../docker'

const handler: RequestHandler = async (req, res) => {
  const containerId = req.params.id
  const hostId = Number(req.params.hostid)

  const host = await getHosts.getOne(hostId)
  if (!host) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid Host ID'
    })
  }

  const client = docker(host)
  try {
    await client.getContainer(containerId).stop()
    return res.json({ message: 'Stopped OK' })
  } catch (ex) {
    return res.status(500).json(ex)
  }
}

export default handler
