import * as db from '../db'
import { Branch, State } from '../types'

export async function upsertRemote(
  app: Concierge.Application,
  remote: Branch,
  state: State,
  imageId?: string
) {
  const existing = await db.getRemote(app.id, remote.ref)
  if (existing) {
    await db.updateRemote(app.id, remote.ref, state, remote.sha)
    return
  }

  await db.insertRemote({
    applicationId: app.id,
    remote: remote.ref,
    seen: remote.seen,
    sha: remote.sha,
    imageId,
    state
  } as Concierge.ApplicationRemote)
}
