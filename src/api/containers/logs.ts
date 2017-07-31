import { RequestHandler } from 'express'
import * as getHosts from '../hosts/db'
import * as stream from 'stream'
import docker from '../docker'

const handler: RequestHandler = async (req, res) => {
  const containerId = req.params.id
  const hostId = req.params.hostid
  const tail = req.query.tail || 50

  const host = await getHosts.getOne(hostId)
  if (!host) {
    res
      .status(400)
      .json({
        status: 400,
        message: 'Invalid Host ID'
      })
    return
  }

  const client = docker(host)
  try {
    const logStream = await client
      .getContainer(containerId)
      .logs({ tail, stdout: true, stderr: true })

    const logs: string[] = []
    const append = (data: Buffer) => {
      logs.push(data.toString())
    }

    const stdout = new stream.PassThrough()
    const stderr = new stream.PassThrough()
    client.modem.demuxStream(logStream, stdout, stderr)

    logStream.on('data', append)
    logStream.on('data', append)
    logStream.on('end', () => res.json(logs))
  } catch (ex) {
    res
      .status(500)
      .json(ex)
  }
}

export default handler