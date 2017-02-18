import db from '../../data/connection'

export async function one(id: number): Promise<Concierge.Application> {
  let query = await db('Applications')
    .select()
    .where({ id })

  return query[0]
};

export async function all(): Promise<Concierge.Application[]> {
  let query = await db('Applications')
    .select()
  return query
};