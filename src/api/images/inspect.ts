import docker from '../docker'
import * as getHosts from '../hosts/db'
import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
  const imageId = req.params.id
  const hostId = Number(req.params.hostId)

  const host = await getHosts.getOne(hostId)
  const client = docker(host)

  const inspectInfo = await client.getImage(imageId).inspect()
  res.json(inspectInfo)
}

export default handler
