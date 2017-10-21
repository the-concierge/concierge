import * as db from '../../data'

export async function one(id: number) {
  const application = (await db
    .applications()
    .select(`${db.APPLICATIONS}.*`, `${db.CREDENTIALS}.name as credentialsName`)
    .where(`${db.APPLICATIONS}.id`, id)
    .leftJoin(db.CREDENTIALS, `${db.CREDENTIALS}.id`, `${db.APPLICATIONS}.credentialsId`)
    .first()) as Concierge.ApplicationDTO

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
  }

  return applications
}

export async function remove(id: number) {
  return db
    .applications()
    .delete()
    .where('id', id)
}

export async function getRemotes(applicationId: number) {
  const remotes: Concierge.ApplicationRemote[] = await db
    .applicationRemotes()
    .select()
    .where('applicationId', applicationId)
    .orderBy('seen', 'asc')
  return remotes
}

export async function updateRemote(
  applicationId: number,
  ref: string,
  state: number,
  sha: string,
  imageId?: string
) {
  const update = imageId ? { state, imageId, sha } : { state, sha }
  return db
    .applicationRemotes()
    .update(update)
    .where('applicationId', applicationId)
    .andWhere('remote', ref)
}

export async function updateRemoteBySha(applicationId: number, sha: string, state: number) {
  return db
    .applicationRemotes()
    .update({ state })
    .where('applicationId', applicationId)
    .andWhere('sha', sha)
}
export async function insertRemote(remote: Concierge.ApplicationRemote) {
  return db.applicationRemotes().insert(remote)
}

export async function getRemote(applicationId: number, ref: string) {
  const remote: Concierge.ApplicationRemote | undefined = await db
    .applicationRemotes()
    .select()
    .where('applicationId', applicationId)
    .andWhere('remote', ref)
    .first()
  return remote
}
