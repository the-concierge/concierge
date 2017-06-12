import { getHosts } from '../../data'

export async function getOne(id: number) {
  const host: Concierge.Host = await getHosts()
    .select()
    .where('id', id)
    .first()
  return host
}

export async function getAll() {
  const hosts: Concierge.Host[] = await getHosts()
    .select()
    .orderBy('id', 'asc')
  return hosts
}
