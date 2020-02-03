import { RequestHandler } from 'express'
import { create, CreateHost } from './db'

const handler: RequestHandler = async (req, res) => {
  const hostname = req.body.hostname || ''
  const vanityHostname = req.body.hostname || hostname || 'localhost'
  const dockerPort = req.body.dockerPort || 2375
  const proxyIp = req.body.proxyIp || ''
  const sshPort = req.body.sshPort || 22
  const capacity = req.body.capacity || 5
  let credentialsId: number | null = Number(req.body.credentialsId)
  if (credentialsId < 1) {
    credentialsId = null
  }

  const body: CreateHost = {
    hostname,
    dockerPort,
    sshPort,
    capacity,
    vanityHostname,
    proxyIp,
    credentialsId
  }

  try {
    const result = await create(body)
    res.json({ ...body, id: result[0] })
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler
