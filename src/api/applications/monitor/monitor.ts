import getTags from '../../git/tags'
import * as db from '../db'
import { State, Branch } from '../types'
import queue from './queue'
import { upsertRemote } from './util'

type MonitoredBranch = Branch & { state: State }

export class RemoteMonitor {
  remotes: { [ref: string]: MonitoredBranch } = {}
  initialised = false

  constructor(public app: Concierge.Application, private isNew: boolean) {}

  initialise = async () => {
    if (this.initialised) {
      return
    }

    const dbRemotes = await db.getRemotes(this.app.id)
    for (const remote of dbRemotes) {
      this.remotes[remote.remote] = {
        ref: remote.remote,
        seen: remote.seen ? new Date(remote.seen) : undefined,
        sha: remote.sha,
        age: remote.age ? new Date(remote.age) : undefined,
        state: remote.state
      }
    }

    const remotes = await getTags(this.app)
    for (const remote of remotes) {
      if (remote.type !== 'branch') {
        continue
      }

      const existingRemote = this.remotes[remote.ref]
      if (existingRemote) {
        continue
      }

      const newRemote = {
        ref: remote.ref,
        sha: remote.sha,
        // When an application first retrieves the remotes, we don't want to build them
        // An undefined 'seen' is considered inactive and won't be built
        seen: new Date(),
        age: remote.age,
        state: this.isNew ? State.Inactive : State.Waiting
      } as MonitoredBranch

      log.debug(`[${this.app.name}] Tracking new branch '${remote.ref}'`)
      this.remotes[remote.ref] = newRemote

      if (isBuildable(this.app, newRemote)) {
        queue.add(this.app, newRemote)
      }

      await upsertRemote(this.app, newRemote, newRemote.state)
    }
    this.initialised = true
    this.poll()
  }

  poll = async () => {
    try {
      const app = await db.one(this.app.id)
      if (!app.autoBuild) {
        return
      }

      const remotes = (await getTags(app)) as Branch[]

      for (const remote of remotes) {
        if (!isBuildableBranch(this.app, remote)) {
          continue
        }

        const existing = this.remotes[remote.ref]
        if (!existing) {
          const newRemote = {
            ref: remote.ref,
            sha: remote.sha,
            seen: new Date(),
            age: remote.age
          } as MonitoredBranch

          this.remotes[remote.ref] = newRemote
          log.info(`Seen ${app.name}/${newRemote.ref}`)
          await upsertRemote(this.app, newRemote, State.Waiting)

          // We will only build branches that are considered active
          if (!isBuildable(this.app, newRemote)) {
            return
          }

          queue.add(app, newRemote)
          return
        }

        if (isBuildable(this.app, remote, existing)) {
          log.debug(
            `[${this.app
              .name}] Detected remote change on '${remote.ref}' ${existing.sha} -> ${remote.sha}`
          )
          existing.sha = remote.sha
          existing.state = State.Waiting
          existing.seen = new Date()
          queue.add(app, existing)
          await upsertRemote(this.app, existing, State.Waiting)
        }
      }
    } finally {
      // TODO: Configurable polling interval per Application
      setTimeout(() => this.poll(), 15000)
    }
  }
}

function isBuildable(
  app: Concierge.Application,
  remote: MonitoredBranch | Branch,
  existing?: MonitoredBranch
) {
  if (!app.autoBuild) {
    return false
  }

  if (!remote.age) {
    return false
  }

  if ((remote as MonitoredBranch).state === State.Inactive) {
    return false
  }

  if (existing) {
    if (remote.sha === existing.sha) {
      return false
    }
  }

  const now = new Date()
  const diff = now.valueOf() - remote.age.valueOf()
  const days = diff / 1000 / 60 / 60 / 24
  return days <= 7
}

function isBuildableBranch(app: Concierge.Application, remote: Branch) {
  if (!app.autoBuild) {
    return false
  }

  if (!remote.age) {
    return false
  }

  const now = new Date()
  const diff = now.valueOf() - remote.age.valueOf()
  const days = diff / 1000 / 60 / 60 / 24
  return days <= 7
}
