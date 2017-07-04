import * as getHosts from '../hosts/db'
import { watchContainer } from './containers'
import * as emitter from './emitter'
import docker from '../docker'

const hostState: { [id: number]: boolean } = {}

export default async function watchHosts() {
  const hosts = await getHosts.getAll()

  for (const host of hosts) {
    const isWatching = hostState[host.id]
    if (isWatching) {
      continue
    }

    const client = docker(host)
    const hostId = host.id
    const hostname = host.hostname
    client.getEvents({}, (err, stream: NodeJS.ReadableStream) => {
      if (err) {
        log.error(`[${hostname}] Failed to monitor host: ${err}`)
        return
      }

      log.info(`[${hostname}] Monitoring host`)
      hostState[hostId] = true
      stream.on('data', event => handleHostEvent(host, event))
    })
  }
}

function handleHostEvent(host: Concierge.Host, rawEvent: string) {
  const event = parseEvent(rawEvent)
  if (!event) {
    return
  }

  const id = (event.id || 'Host').slice(0, 10)
  const status = (event.status || 'unknown').toLowerCase()
  log.info(`[${host.hostname}:${id}] Emitted '${event.Type}:${event.Action}'`)

  emitter.host(host.hostname, event)

  const isStartEvent = status.toLowerCase() === 'start'
  const isContainer = id !== 'Host'
  if (isContainer && isStartEvent) {
    watchContainer(host, event.id)
  }
}

function parseEvent(rawEvent: string) {
  try {
    const event: DockerEvent = JSON.parse(rawEvent)
    return event
  } catch (ex) {
    log.warn(`Failed to parse Host Event`)
    log.debug(rawEvent)
    return undefined
  }
}

interface DockerEvent {
  Type: string
  Action: string
  status: string
  id: string
  from: string
  time: string
}