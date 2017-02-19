import db from '../data/connection'

export async function one(id: number): Promise<Concierge.Container> {
  return await db('Containers')
    .select(...columns)
    .where('Containers.id', id)
    .first()
    .leftJoin(joinClause[0], joinClause[1], joinClause[2])
}

export async function all(): Promise<Concierge.Container[]> {
  return await (
    db('Containers')
      .select(...columns)
      .leftJoin(joinClause[0], joinClause[1], joinClause[2]))
}

export async function bySubdomain(subdomain: string): Promise<Concierge.Container> {
  return await db('Containers')
    .select(...columns)
    .where({ subdomain })
    .leftJoin(joinClause[0], joinClause[1], joinClause[2])
    .limit(1)
}

const columns = [
  'Containers.*',
  'Applications.name as applicationName'
]

const joinClause = [
  'Applications',
  'Applications.id',
  'Containers.applicationId'
]
