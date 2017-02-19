import db from '../data/connection'

export async function one(hostName: string | number): Promise<Concierge.Host> {
  let query = await db('Hosts')
    .select()
    .where('hostname', hostName)
    .orWhere('id', hostName)
  return query[0]
}

export async function all(): Promise<Concierge.Host[]> {
  let query = await db('Hosts').select()
  return query
};