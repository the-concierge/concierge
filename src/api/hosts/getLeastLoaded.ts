import isOnline from './isOnline'
import * as getHosts from './get'
import * as getContainers from '../containers/get'

/**
 * Locate the Host that has the least amount of Containers running
 */
export default async function getHostForContainer(): Promise<Concierge.Host> {
  const hosts = getHosts.all()
  const containers = getContainers.all()
  const entities = await Promise.all([hosts, containers])

  const loads = getHostLoads(entities)
  return getLowestLoadedHost(loads)
}

function getHostLoads([hosts, containers]: [Concierge.Host[], Concierge.Container[]]) {
  const hasHosts = hosts.length > 0
  if (!hasHosts) {
    throw new Error('[HOST.ALLOCATE] There are no hosts available. Please assign at least one.')
  }

  let hostLoads = hosts.map(host => hostLoadPercentage(host, containers))
  return hostLoads
}

async function getLowestLoadedHost(hosts: Concierge.Host[]) {
  const orderedHosts = hosts.slice().sort((l, r) => l.capacity - r.capacity)

  // Find the first online in the array of hosts
  const toOnlineHostIndex = (hostIndex, hostIsOnline, index) => {
    if (hostIndex === -1 && hostIsOnline === true) {
      hostIndex = index
    }
    return hostIndex
  }

  const hostStatuses: boolean[] = []
  for (const host of orderedHosts) {
    hostStatuses.push(await isOnline(host))
  }

  const onlineHostIndex = hostStatuses.reduce(toOnlineHostIndex, -1)
  if (onlineHostIndex === -1) {
    throw new Error('No hosts are currently online')
  }
  return orderedHosts[onlineHostIndex]
}

function hostLoadPercentage(host: Concierge.Host, containers: Concierge.Container[]) {
  let hostedCount = containers.reduce((count, current) => {
    let isMatching = current.host === host.hostname
    if (isMatching) {
      count++
    }
    return count
  }, 0)

  let load = Math.round((hostedCount / host.capacity) * 10000) / 100
  host.capacity = load
  return host
}