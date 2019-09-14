import * as db from '../../data'

export async function one(id: number) {
  const application = (await db
    .applications()
    .select(`${db.APPLICATIONS}.*`, `${db.CREDENTIALS}.name as credentialsName`)
    .where(`${db.APPLICATIONS}.id`, id)
    .leftJoin(db.CREDENTIALS, `${db.CREDENTIALS}.id`, `${db.APPLICATIONS}.credentialsId`)
    .first()) as Concierge.ApplicationDTO

  if (!application) {
    return
  }

  application.credentialsName = application.credentialsName || 'N/A'
  return application
}

export async function all() {
  const applications: Concierge.ApplicationDTO[] = await db
    .applications()
    .select(`${db.APPLICATIONS}.*`, `${db.CREDENTIALS}.name as credentialsName`)
    .leftJoin(db.CREDENTIALS, `${db.CREDENTIALS}.id`, `${db.APPLICATIONS}.credentialsId`)
    .orderBy(`${db.APPLICATIONS}.id`, 'asc')

  for (const app of applications) {
    app.credentialsName = app.credentialsName || 'N/A'
    app.autoBuild = !!app.autoBuild
  }

  return applications
}

export async function remove(id: number | string) {
  await db
    .applicationRemotes()
    .delete()
    .where('applicationId', id)

  await db
    .applications()
    .delete()
    .where('id', id)
}

export async function getRemotes(applicationId: number) {
  const remotes: Schema.ApplicationRemote[] = await db
    .applicationRemotes()
    .select()
    .where('applicationId', applicationId)
    .orderBy('seen', 'asc')
  return remotes
}

export async function removeRemote(applicationId: number, remote: string) {
  const rowsDeleted = await db
    .applicationRemotes()
    .delete()
    .where('applicationId', applicationId)
    .andWhere('remote', remote)

  if (rowsDeleted !== 1) {
    throw new Error('Failed to remove ApplicationRemote: Row not found')
  }
}

export async function updateRemote(
  applicationId: number,
  ref: string,
  props: Partial<Schema.ApplicationRemote>
) {
  return db
    .applicationRemotes()
    .update(props)
    .where('applicationId', applicationId)
    .andWhere('remote', ref)
}

export async function insertRemote(remote: Schema.ApplicationRemote) {
  return db.applicationRemotes().insert(remote)
}

export async function getRemote(applicationId: number, ref: string) {
  const remote: Schema.ApplicationRemote | undefined = await db
    .applicationRemotes()
    .select()
    .where('applicationId', applicationId)
    .andWhere('remote', ref)
    .first()
  return remote
}

export async function getAllRemotes() {
  const remotes: Schema.ApplicationRemote[] = await db.applicationRemotes().select()
  return remotes
}
