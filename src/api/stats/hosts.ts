import * as getHosts from '../hosts/db'
import { watchContainer } from './containers'
import * as emitter from './emitter'
import docker from '../docker'

const hostState: { [id: number]: boolean } = {}

export default async function watchHosts() {
  const hosts = await getHosts.getAll()

  for (const host of hosts) {
    const hostId = host.id as number
    const isWatching = hostState[hostId]
    if (isWatching) {
      continue
    }

    const client = docker(host)
    const hostname = host.hostname || host.vanityHostname
    client.getEvents({}, (err, stream) => {
      if (err || !stream) {
        log.error(`[${hostname}] Failed to monitor host: ${err}`)
        return
      }

      log.info(`[${hostname}] Monitoring host`)
      hostState[hostId] = true
      stream.on('data', (event: any) => handleHostEvent(host, event))
    })
  }
}

function handleHostEvent(host: Schema.Host, rawEvent: string) {
  const events = parseEvent(rawEvent)
  if (!events) {
    return
  }

  for (const event of events) {
    const id = (event.id || 'Host').slice(0, 10)
    const status = (event.status || 'unknown').toLowerCase()
    log.info(`[${host.hostname}:${id}] Emitted '${event.Type}:${event.Action}'`)

    emitter.host(host.hostname, events)

    const isStartEvent = status.toLowerCase() === 'start'
    const isContainer = id !== 'Host'
    if (isContainer && isStartEvent) {
      watchContainer(host, event.id)
    }
  }
}

function parseEvent(rawEvent: string) {
  try {
    const event: DockerEvent = JSON.parse(rawEvent)
    return [event]
  } catch (ex) {
    try {
      const events: DockerEvent[] = rawEvent
        .trim()
        .split('\n')
        .map(raw => JSON.parse(raw))
      return events
    } catch (ex) {
      log.warn(`Failed to parse Host Event`)
      log.debug(rawEvent.toString())
      return undefined
    }
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
