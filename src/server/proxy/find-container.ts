import * as db from '../../api/hosts/db'
import { getContainers } from '../../api/hosts/get-containers'
import { ContainerInfo } from 'dockerode'

export default async function findContainer(name: string | undefined) {
  const hosts = await db.getAll()
  const containerLists = await Promise.all(hosts.map(getContainers))

  type ConciergeContainerInfo = typeof containerLists[0][0]
  const container = containerLists.reduce(
    (prev, curr) => {
      if (prev) {
        return prev
      }

      const container = curr.find(container => toContainerName(container) === name)
      return container
    },
    undefined as ConciergeContainerInfo | undefined
  )

  return container
}

function toContainerName(container: ContainerInfo) {
  return container.Names[0].slice(1)
}
