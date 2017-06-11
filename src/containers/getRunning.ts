import client from '../dockerClient'
import { all } from '../hosts/get'

export async function getAllRunning() {
  const hosts = await all()

  const containers = await Promise.all(hosts.map(getRunningContainers))

  const flat = containers.reduce((list, curr) => {
    list.push(...curr)
    return list
  }, [])

  return flat
}

export function getRunningContainers(host: Concierge.Host) {
  const promise = new Promise<Concierge.APIContainer[]>((resolve, reject) => {
    client(host).listContainers((err, containers) => {
      if (err) {
        return reject(err)
      }

      const apiContainers = containers.map(container => {
        return {
          id: 0,
          applicationId: 0,
          applicationName: 'None',
          cpu: '0',
          dockerId: container.Id.slice(0, 10),
          dockerImage: container.Image,
          host: host.hostname,
          isProxying: 0,
          label: container.Names[0],
          memory: '0',
          port: 0,
          responseTime: 'None',
          subdomain: 'None',
          variables: '[]',
          variant: 'None'
        }
      })

      resolve(apiContainers)
    })
  })

  return promise
}
