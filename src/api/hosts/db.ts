import * as db from '../../data'

export async function getOne(id: number) {
  const host: Schema.Host = await db
    .hosts()
    .select()
    .where('id', id)
    .first()
  return host
}

export async function getAll() {
  const hosts: Schema.Host[] = await db
    .hosts()
    .select()
    .orderBy('id', 'asc')
  return hosts
}

export interface CreateHost {
  credentialsId: number | null
  hostname: string
  dockerPort: number
  sshPort: number
  capacity: number
  vanityHostname: string
  proxyIp: string
}

export async function create(host: CreateHost) {
  const result: number[] = await db.hosts().insert({ ...host })
  return result
}
