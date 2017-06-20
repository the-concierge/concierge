import * as db from '../../data'

export async function one(id: number) {
  const application = await db.applications()
    .select()
    .where('id', id)
    .first() as Concierge.Application
  return application
}

export async function all() {
  const applications: Concierge.Application[] = await db.applications()
    .select()
    .orderBy('id', 'asc')
  return applications
}