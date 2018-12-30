import * as db from '../../data'

export async function one(id: number) {
  const creds: Schema.Credentials = await db
    .credentials()
    .select()
    .where('id', id)
    .first()
  return creds
}

export async function all() {
  const creds: Schema.Credentials[] = await db
    .credentials()
    .select()
    .orderBy('id', 'asc')
  return creds
}

export async function remove(id: number) {
  const apps: Schema.Application[] = await db
    .applications()
    .select()
    .where('credentialsId', id)

  if (apps.length > 0) {
    throw new Error('Unable to remove Credenitials: Applications reference these credentials')
  }

  return db
    .credentials()
    .delete()
    .where('id', id)
}
