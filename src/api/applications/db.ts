import * as db from '../../data'

export async function one(id: number) {
  const application = await db.applications()
    .select(`${db.APPLICATIONS}.*`, `${db.CREDENTIALS}.name as credentialsName`)
    .where(`${db.APPLICATIONS}.id`, id)
    .leftJoin(db.CREDENTIALS, `${db.CREDENTIALS}.id`, `${db.APPLICATIONS}.credentialsId`)
    .first() as Concierge.ApplicationDTO

  application.credentialsName = application.credentialsName || 'N/A'
  return application
}

export async function all() {
  const applications: Concierge.ApplicationDTO[] = await db.applications()
    .select(`${db.APPLICATIONS}.*`, `${db.CREDENTIALS}.name as credentialsName`)
    .leftJoin(db.CREDENTIALS, `${db.CREDENTIALS}.id`, `${db.APPLICATIONS}.credentialsId`)
    .orderBy(`${db.APPLICATIONS}.id`, 'asc')

  for (const app of applications) {
    app.credentialsName = app.credentialsName || 'N/A'
  }

  return applications
}

export async function remove(id: number) {
  return db.applications()
    .delete()
    .where('id', id)
}