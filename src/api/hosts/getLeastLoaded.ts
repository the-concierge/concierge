import isOnline from './isOnline'
import * as getHosts from './get'
import * as getContainers from '../containers/get'

/**
 * Locate the Host that has the least amount of Containers running
 */
export default function getHostForContainer(): Promise<Concierge.Host> {
  let hosts = getHosts.all()
  let containers = getContainers.all()

  return Promise.all([hosts, containers])
    .then(getHostLoads)
    .then(getLowestLoadedHost)
}

function getHostLoads(promiseResult: any[]): Promise<any> {
  let hosts: Concierge.Host[] = promiseResult[0]
  let containers: Concierge.Container[] = promiseResult[1]

  let hasHosts = hosts.length > 0
  if (!hasHosts) {
    return Promise.reject('[HOST.ALLOCATE] There are no hosts available. Please assign at least one.')
  }

  let hostLoads = hosts.map(host => hostLoadPercentage(host, containers))
  return Promise.resolve(hostLoads)
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