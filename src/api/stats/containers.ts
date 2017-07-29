import { Readable } from 'stream'
import * as getHosts from '../hosts/db'
import { heartbeats } from '../../data'
import docker from '../docker'
import * as emitter from './emitter'
import * as analysis from 'analysis'
import { getConfig } from '../configuration/db'

type Stats = {
  containerId: string
  hostId: number
  json: string
  cpu: number[]
  memory: number[]
}

const containerStats: { [id: string]: Stats } = {}

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
  containerStats[containerId] = { json: '', cpu: [], memory: [], hostId: host.id, containerId }

  client.getContainer(containerId)
    .stats((err, stream: Readable) => {
      log.info(`[${containerId.slice(0, 10)}] Monitoring container`)
      stream.on('data', (data: Buffer) => parseData(containerId, data))
      stream.on('end', () => {
        log.info(`[${containerId.slice(0, 10)}] Stats stream ended`)
        delete containerStats[containerId]
      })
      stream.on('error', (err) => log.info(`[${containerId.slice(0, 10)}] Stats stream errored: ${err}`))
    })
}

function parseData(containerId: string, buffer: Buffer) {
  const stats = containerStats[containerId]
  const rawJson = stats.json + buffer.toString()

  try {
    const json = JSON.parse(rawJson)
    const memory = getMemory(json)
    const cpu = getCPU(json)
    const io = getDataTransfer(json)

    json.memory = isNaN(memory) ? '...' : memory + '%'
    json.cpu = isNaN(cpu) ? '...' : cpu + '%'
    json.tx = io.tx
    json.rx = io.rx

    emitter.containerStats(containerId, json)
    stats.cpu.push(cpu)
    stats.memory.push(memory)
    stats.json = ''
    persist(stats)

  } catch (_) {
    stats.json = rawJson
  }
}

function getCPU(event: ContainerEvent) {
  const postCpuStats = event.cpu_stats
  const preCpuStats = event.precpu_stats
  const x = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage
  const y = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage
  const cpuPercent = analysis.common.round((x / (x + y) * 100), 2)
  return isNaN(cpuPercent) ? 0 : cpuPercent
}

function getDataTransfer(event: ContainerEvent) {
  const networks = event.networks || {}
  const eth0 = networks['eth0']
  if (eth0) {
    return {
      rx: analysis.common.round(eth0.rx_bytes / 1024 / 1024, 2) + 'MB',
      tx: analysis.common.round(eth0.tx_bytes / 1024 / 1024, 2) + 'MB'
    }
  }

  return {
    rx: '...',
    tx: '...'
  }
}

function getMemory(event: ContainerEvent) {
  const memStats = event.memory_stats
  const memory = (memStats.usage / 1024 / 1024) / (memStats.limit / 1024 / 1024) * 100
  const memPercent = analysis.common.round(memory, 2)
  return isNaN(memPercent) ? 0 : memPercent
}

async function persist(stats: Stats) {
  const config = await getConfig()

  const binSize = Number(config.statsBinSize)

  // Truncate records older than the retention limit
  const now = new Date()
  const boundary = now.setDate(now.getDate() - config.statsRetentionDays).valueOf()
  await heartbeats()
    .delete()
    .where('timestamp', '<', boundary)

  // CPU and Memory will be same length in container stats
  // Use either
  if (stats.cpu.length < binSize) {
    return
  }

  const cpu = analysis.descriptive.box(stats.cpu)
  const memory = analysis.descriptive.box(stats.memory)

  await heartbeats()
    .insert({
      hostId: stats.hostId,
      containerId: stats.containerId,
      cpu: JSON.stringify(cpu),
      memory: JSON.stringify(memory),
      timestamp: Date.now()
    })

  // Reset stats bin
  stats.cpu = []
  stats.memory = []
}