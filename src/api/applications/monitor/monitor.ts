import getTags from '../../git/tags'
import * as db from '../db'
import { State, Branch } from '../types'
import queue, { StrictBranch } from './queue'
import { insertRemote, updateRemoteState } from './util'
import { buildStatus } from '../../stats/emitter'

type Action = 'new' | 'change' | 'done' | 'inactive'

export class RemoteMonitor {
  remotes: { [ref: string]: StrictBranch } = {}
  initialised = false

  constructor(public app: Concierge.Application) {}

  debug = (message: string) => log.debug(`[${this.app.name}] ${message}`)
  error = (message: string) => log.error(`[${this.app.name}] ${message}`)
  warn = (message: string) => log.warn(`[${this.app.name}] ${message}`)
  info = (message: string) => log.info(`[${this.app.name}] ${message}`)

  initialise = async (isNewApplication: boolean, retryOffset: number = 5) => {
    if (this.initialised) {
      return
    }

    try {
      log.debug(`[${this.app.name}] Initialing application tracking`)
      const dbRemotes = await db.getRemotes(this.app.id)

      for (const remote of dbRemotes) {
        if (remote.state === State.Building) {
          // This is an invalid state and is indicative of a failed build
          await db.updateRemote(this.app.id, remote.remote, { state: State.Failed })
        }

        this.remotes[remote.remote] = {
          ref: remote.remote,
          seen: remote.seen ? new Date(remote.seen) : undefined,
          sha: remote.sha,
          age: new Date(remote.age)
        }
      }

      const remotes = await getTags(this.app, true)
      for (const remote of remotes) {
        if (!remote.age) {
          continue
        }

        if (remote.type !== 'branch') {
          continue
        }

        await this.processBranch(remote as StrictBranch, isNewApplication)
      }

      this.initialised = true
      this.debug(`Tracking application`)
      this.poll()
    } catch (ex) {
      this.error(`Failed to initialise tracking. Retrying`)
      setTimeout(() => this.initialise(isNewApplication, retryOffset + 5), retryOffset * 1000)
    }
  }

  processBranch = async (branch: StrictBranch, isNewApplication: boolean) => {
    const action = this.getBranchAction(branch, isNewApplication)
    switch (action) {
      case 'done':
      case 'inactive':
        return
      case 'new':
        this.debug(`Tracking new branch '${branch.ref}'`)
        await this.insertNewRemote(branch)
        break
      case 'change':
        this.debug(`Updated updated '${branch.ref}'`)
        break
    }

    this.remotes[branch.ref] = branch

    if (isBuildable(this.app, branch)) {
      await queue.add(this.app, branch)
    }
  }

  insertNewRemote = async (remote: StrictBranch) => {
    await insertRemote(this.app, {
      remote: remote.ref,
      sha: remote.sha,
      age: remote.age.toISOString(),
      seen: new Date().toISOString(),
      state: State.NotDetermined
    })
  }

  handleDeletedBranches = async (remotes: Branch[]) => {
    // We want to mark branches that have been deleted from origin as Deleted
    // to allow the front-end to handle Deleted branches differently
    for (const remoteRef of Object.keys(this.remotes)) {
      const isNoLongerRemote = remotes.every(remote => remote.ref !== remoteRef)
      if (!isNoLongerRemote) {
        continue
      }

      log.debug(`[${this.app.name}] Branch '${remoteRef}' deleted from origin`)
      const dbRemote = await db.getRemote(this.app.id, remoteRef)

      await updateRemoteState(this.app, remoteRef, State.Deleted)
      buildStatus(this.app.id, { ...dbRemote, state: State.Deleted })
    }
  }

  poll = async () => {
    try {
      const app = await db.one(this.app.id)
      if (!app) {
        return
      }

      const remotes = (await getTags(app, true)) as StrictBranch[]
      await this.handleDeletedBranches(remotes)

      for (const remote of remotes) {
        if (!isBuildableBranch(remote)) {
          continue
        }

        await this.processBranch(remote, false)
      }
    } finally {
      // TODO: Configurable polling interval per Application
      setTimeout(() => this.poll(), 15000)
    }
  }

  getBranchAction = (branch: Branch, isNewApplication: boolean): Action => {
    if (isNewApplication) {
      return 'inactive'
    }

    const existing = this.remotes[branch.ref]
    if (!existing) {
      return 'new'
    }

    if (!branch.age) {
      return 'inactive'
    }

    if (!isActive(new Date(branch.age))) {
      return 'inactive'
    }

    if (branch.sha !== existing.sha) {
      return 'change'
    }

    return 'done'
  }
}

function isActive(date: Date) {
  const threshold = new Date()

  // TODO: Retrieve limit from config
  const limit = 7
  threshold.setDate(threshold.getDate() - limit)
  return date.valueOf() >= threshold.valueOf()
}

function isBuildable(app: Concierge.Application, remote: Branch) {
  if (!app.autoBuild) {
    return false
  }

  return isBuildableBranch(remote)
}

function isBuildableBranch(remote: Branch) {
  if (!remote.age) {
    return false
  }

  const now = new Date()
  const diff = now.valueOf() - remote.age.valueOf()
  const days = diff / 1000 / 60 / 60 / 24
  return days <= 7
}
