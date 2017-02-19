import db from '../data/connection'

export async function one (id: number): Promise<Concierge.Concierge> {
  let query = await db('Concierges')
    .select()

  return query[0]
}

export async function all (): Promise<Concierge.Concierge[]> {
  let query = await db('Concierges')
    .select()
  return query
}