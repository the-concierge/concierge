import { RequestHandler } from 'express'
import { ContainerInfo } from 'dockerode'
import getClient from '../docker'
import * as get from './db'

export const getOne: RequestHandler = async (req, res) => {
  const host: Concierge.Host = await get.getOne(req.params.id)
  const containers = await getContainers(host)
  res.json(containers)
}

export const getAll: RequestHandler = async (req, res) => {
  const hosts: Concierge.Host[] = await get.getAll()
  const containerLists = await Promise.all(hosts.map(getContainers))
  const containers = containerLists.reduce((list, curr) => {
    list.push(...curr)
    return list
  }, [])

  res.json(containers)
}

interface ConciergeContainerInfo extends ContainerInfo {
  concierge: {
    hostId: number
    host: {
      id: number
      hostname: string
      proxyIp: string
      vanityHostname: string
      capacity: number
      dockerPort: number
    }
  }
}

export async function getContainers(host: Concierge.Host) {
  const client = getClient(host)
  const hostDto = { ...host }
  delete hostDto.privateKey
  delete hostDto.sshUsername
  delete hostDto.sshPort
  const containers = await client.listContainers({
    all: 1
  })

  containers.forEach(container => {
    container['concierge'] = {
      hostId: host.id,
      host: hostDto
    }
  })
  return containers as ConciergeContainerInfo[]
}