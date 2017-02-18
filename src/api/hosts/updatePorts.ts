import getContainerInfo from './getContainers'
import * as getContainers from '../containers/get'
import db from '../../data/connection'

/**
 * Get the current exposed ports for all Containers on all Hosts
 */
export default async function update() {
  const containers = await getContainers.all()
  const containersInfo = await getContainerInfo()
  const trx = await db.getTransaction()

  try {
    const updateResults = []
    for (const container of containers) {
      const port = getPort(container, containersInfo)
      if (!port) {
        return null
      }

      const result = await db('Containers')
        .update({ port })
        .where({ id: container.id })
        .transacting(trx)
      updateResults.push(result)
    }

    await trx.commit()
    return updateResults
  } catch (ex) {
    await (trx.rollback())
    throw new Error(`Failed to updates ports: ${ex.message}`)
  }
}

function getPort(container: Concierge.Container, containersInfo: any[]) {

  let info = getInfo(containersInfo, container.dockerId)
  if (!info) {
    return null
  }

  if (info.Ports.length === 0) {
    return 0
  }
  return info.Ports[0].PublicPort
}

function getInfo(info: any[], dockerId: string) {
  let matchingInfo = info.reduce((prev, curr) => {
    if (prev) {
      return prev
    }

    let isMatch = dockerId === curr.Id
    if (isMatch) {
      prev = curr
    }
    return prev
  }, null)
  return matchingInfo
}