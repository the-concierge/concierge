import { RequestHandler } from 'express'
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

async function getContainers(host: Concierge.Host) {
  const client = getClient(host)
  const containers = await client.listContainers()
  return containers
}