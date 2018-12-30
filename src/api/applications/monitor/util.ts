import * as db from '../db'
import { State } from '../types'

type UpsertRemote = Pick<
  Schema.ApplicationRemote,
  'remote' | 'state' | 'state' | 'sha' | 'seen' | 'age'
>

export async function insertRemote(app: Schema.Application, props: UpsertRemote) {
  const existing = await db.getRemote(app.id, props.remote)
  if (existing) {
    const error = 'Attempting to insert remote that already exists'
    log.error(error)
    throw new Error(error)
  }

  await db.insertRemote({
    applicationId: app.id,
    remote: props.remote,
    seen: props.seen,
    sha: props.sha,
    state: props.state,
    age: props.age
  } as Schema.ApplicationRemote)
}

export async function updateRemoteState(app: Schema.Application, remote: string, state: State) {
  await db.updateRemote(app.id, remote, { state })
}
