import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id
  const hostname = req.body.hostname
  const proxyIp = req.body.proxyIp
  const vanityHostname = req.body.vanityHostname
  const dockerPort = req.body.dockerPort || 2375
  const sshPort = req.body.sshPort || 22
  const capacity = req.body.capacity || 5
  let credentialsId: number | null = Number(req.body.credentialsId)

  if (credentialsId < 1) {
    credentialsId = null
  }

  const body: Omit<Schema.Host, 'id'> = {
    hostname,
    dockerPort,
    sshPort,
    capacity,
    vanityHostname,
    proxyIp,
    credentialsId
  }

  try {
    const result: number[] = await db
      .hosts()
      .update({ ...body })
      .where('id', id)
    res.json({ ...body, id: result[0] })
  } catch (ex) {
    res.status(500)
    res.json({ message: ex.message || ex })
  }
}

export default handler
