import { Readable } from 'stream'
import * as getHosts from '../hosts/db'
import { ContainerInfo } from 'dockerode'
import docker from '../docker'
import * as emitter from '../../events/emitter'

const containerStats: { [id: string]: string } = {}

export default async function monitorAll() {
  const hosts = await getHosts.getAll()

  for (const host of hosts) {
    const client = docker(host)

    const containers = await client.listContainers()

    for (const container of containers) {
      containerStats[container.Id] = ''

      client.getContainer(container.Id)
        .stats((err, stream: Readable) => {
          log.info(`Monitoring ${container.Id.slice(0, 10)}`)
          stream.on('data', (data: Buffer) => parseData(container, data))
        })

    }
  }
}

function parseData(container: ContainerInfo, buffer: Buffer) {
  const preStats = containerStats[container.Id]
  const stats = preStats + buffer.toString()

  try {
    const json = JSON.parse(stats)
    emitter.containerStats(container.Id, json)
    containerStats[container.Id] = ''
  } catch (_) {
    containerStats[container.Id] = stats
  }
}