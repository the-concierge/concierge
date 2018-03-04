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
