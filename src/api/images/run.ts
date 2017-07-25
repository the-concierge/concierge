import docker from '../docker'
import * as db from '../hosts/db'
import { ContainerCreateOptions } from 'dockerode'
import { RequestHandler } from 'express'

type Body = {
  name: string
  image: string
  envs: Env[]
  volumes: Volume[]
  ports: Port[]
  links: Link[]
}

type Link = { containerName: string, alias: string }
type Port = { expose: boolean, port: number, type: string, hostPort: string }
type Volume = { hostPath: string, path: string }
type Env = { key: string, value: string }

const handler: RequestHandler = async (req, res) => {
  const { name, image, envs, ports, volumes, links } = req.body as Body

  const exposedPorts = ports
    .filter(port => port.expose)
    .reduce((prev, curr) => {
      const key = `${curr.port}/${curr.type}`
      prev[key] = {}
      return prev
    },
    {} as any)

  const portBindings = ports
    .filter(port => port.expose)
    .reduce((prev, curr) => {
      const key = `${curr.port}/${curr.type}`
      const hostCfg: any = {}

      // If a hostPort is specified, pass the option through to Docker
      if (curr.hostPort) {
        hostCfg.HostPort = curr.hostPort
      }
      prev[key] = [hostCfg]
      return prev
    },
    {} as any)

  const binds = volumes
    .filter(vol => !!vol.hostPath)
    .map(vol => `${vol.hostPath}:${vol.path}`)

  const containerLinks = links.map(link => `${link.containerName}:${link.alias}`)

  const options: ContainerCreateOptions = {
    name,
    Image: image,
    Env: envs.map(env => `${env.key}=${env.value}`),
    ExposedPorts: exposedPorts,
    HostConfig: {
      Binds: binds,
      PortBindings: portBindings,
      RestartPolicy: {
        Name: 'on-failure',
        MaximumRetryCount: 3
      },
      Links: containerLinks
    }
  }

  if (name.length === 0) {
    delete options.name
  }

  const host = await getAvailableHost()

  try {
    const container = await host.client.createContainer(options)
    await container.start()
    res.json({
      id: container.id,
      host: host.host.hostname
    })
  } catch (ex) {
    res
      .status(500)
      .json({ message: ex.message || ex })
  }

}

async function getAvailableHost() {
  const hosts = await db.getAll()
  if (hosts.length === 0) {
    throw new Error(`No hosts exists`)
  }

  const loads = await Promise.all(hosts.map(getHostLoads))
  loads.sort((left, right) => left > right ? 1 : -1)
  const leastLoaded = loads[0]
  return leastLoaded
}

async function getHostLoads(host: Concierge.Host) {
  const client = docker(host)
  const containers = await client.listContainers()
  const percentage = containers.length / host.capacity
  return {
    host,
    client,
    percentage,
    containers: containers.length,
    capacity: host.capacity
  }
}

export default handler