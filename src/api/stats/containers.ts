import { Readable } from 'stream'
import * as getHosts from '../hosts/db'
import docker from '../docker'
import * as emitter from './emitter'

const containerStats: { [id: string]: string } = {}

export default async function monitorAll() {
  const hosts = await getHosts.getAll()

  for (const host of hosts) {
    const client = docker(host)
    const containers = await client.listContainers()

    for (const container of containers) {
      watchContainer(host, container.Id)
    }
  }
}

export function watchContainer(host: Concierge.Host, containerId: string) {
  if (containerStats[containerId] !== undefined) {
    return
  }

  const client = docker(host)
  containerStats[containerId] = ''

  client.getContainer(containerId)
    .stats((err, stream: Readable) => {
      log.info(`[${containerId.slice(0, 10)}] Monitoring container`)
      stream.on('data', (data: Buffer) => parseData(containerId, data))
      stream.on('end', () => {
        log.info(`[${containerId.slice(0, 10)}] Stats stream ended`)
        delete containerStats[containerId]
      })
      stream.on('error', (err) => log.info(`[${containerId.slice(0, 10)}] Stats stream errored: ${err}`) )
    })
}

function parseData(containerId: string, buffer: Buffer) {
  const preStats = containerStats[containerId]
  const stats = preStats + buffer.toString()

  try {
    const json = JSON.parse(stats)
    emitter.containerStats(containerId, json)
    containerStats[containerId] = ''
  } catch (_) {
    containerStats[containerId] = stats
  }
}