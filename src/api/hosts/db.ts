import * as db from '../../data'

export async function getOne(id: number) {
  const host: Concierge.Host = await db
    .hosts()
    .select()
    .where('id', id)
    .first()
  return host
}

export async function getAll() {
  const hosts: Concierge.Host[] = await db
    .hosts()
    .select()
    .orderBy('id', 'asc')
  return hosts
}

export interface CreateHost {
  hostname: string
  dockerPort: number
  sshPort: number
  capacity: number
  sshUsername: string
  vanityHostname: string
  proxyIp: string
  privateKey: string
}

export async function create(host: CreateHost) {
  const result: number[] = await db.hosts().insert({ ...host })
  return result
}
