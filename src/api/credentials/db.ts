import * as db from '../../data'

export async function one(id: number) {
  const creds = (await db
    .credentials()
    .select()
    .where('id', id)
    .first()) as Concierge.Credentials
  return creds
}

export async function all() {
  const creds: Concierge.Credentials[] = await db
    .credentials()
    .select()
    .orderBy('id', 'asc')
  return creds
}

export async function remove(id: number) {
  const apps = (await db
    .applications()
    .select()
    .where('credentialsId', id)) as Concierge.Application[]

  if (apps.length > 0) {
    throw new Error('Unable to remove Credenitials: Applications reference these credentials')
  }

  return db
    .credentials()
    .delete()
    .where('id', id)
}
