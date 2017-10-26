import getTags from '../../git/tags'
import * as db from '../db'
import { State, Branch } from '../types'
import queue, { StrictBranch } from './queue'
import { insertRemote } from './util'
import { buildStatus } from '../../stats/emitter'

type Action = 'new' | 'change' | 'done' | 'inactive' | 'deleted'

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

      await this.processBranches(isNewApplication)

      this.initialised = true
      this.debug(`Tracking application`)
      this.poll()
    } catch (ex) {
      this.error(`Failed to initialise tracking. Retrying`)
      setTimeout(() => this.initialise(isNewApplication, retryOffset + 5), retryOffset * 1000)
    }
  }

  processBranches = async (isNewApplication: boolean) => {
    const app = await db.one(this.app.id)
    if (!app) {
      return
    }

    const remotes = (await getTags(this.app, true)) as StrictBranch[]
    const visited = new Set<string>()
    for (const current of remotes) {
      visited.add(current.ref)
      const existing = this.remotes[current.ref]

      const action = getBranchAction({ existing, current }, isNewApplication)
      await this.processBranch(current || existing, action)
    }

    // Deal with deleted branches
    for (const ref in this.remotes) {
      if (visited.has(ref)) {
        continue
      }

      const existing = this.remotes[ref]
      const current = remotes.find(remote => remote.ref === ref)
      const action = getBranchAction({ existing, current }, isNewApplication)
      if (action !== 'deleted') {
        continue
      }

      await this.processBranch(existing, action)
    }
  }

  processBranch = async (branch: StrictBranch, action: Action) => {
    switch (action) {
      case 'deleted':
        await db.removeRemote(this.app.id, branch.ref)
        this.debug(`'${branch.ref}' deleted from origin`)
        buildStatus(this.app.id, {
          applicationId: this.app.id,
          sha: branch.sha,
          remote: branch.ref,
          state: State.Deleted,
          age: branch.age.toISOString(),
          seen: new Date().toISOString()
        })
        delete this.remotes[branch.ref]
        return

      case 'done':
      case 'inactive':
        return

      case 'new':
        this.debug(`Tracking new branch '${branch.ref}'`)
        await insertNewRemote(this.app, branch)
        break

      case 'change':
        this.debug(`Updated branch '${branch.ref}'`)
        await db.updateRemote(this.app.id, branch.ref, { age: branch.age.toISOString() })
        break
    }

    this.remotes[branch.ref] = branch
    if (isBuildable(this.app, branch)) {
      await queue.add(this.app, branch)
    }
  }

  private poll = async () => {
    try {
      await this.processBranches(false)
    } finally {
      // TODO: Configurable polling interval per Application
      setTimeout(() => this.poll(), 15000)
    }
  }
}

async function insertNewRemote(app: Concierge.Application, remote: StrictBranch) {
  await insertRemote(app, {
    remote: remote.ref,
    sha: remote.sha,
    age: remote.age.toISOString(),
    seen: new Date().toISOString(),
    state: State.NotDetermined
  })
}

function getBranchAction(
  state: { existing?: StrictBranch; current?: StrictBranch },
  isNewApplication: boolean
): Action {
  const existing = state.existing
  const current = state.current

  if (!current && !existing) {
    throw new Error('Invalid branch action call: No existing or current branch provided')
  }

  if (isNewApplication) {
    return 'inactive'
  }

  const isNoLongerRemote = !!existing && !current
  if (isNoLongerRemote) {
    return 'deleted'
  }

  const isNewRemote = !existing && !!current
  if (isNewRemote) {
    return 'new'
  }

  if (!isActive(new Date(current!.age))) {
    return 'inactive'
  }

  if (current!.sha !== existing!.sha) {
    return 'change'
  }

  return 'done'
}

function isBuildable(app: Concierge.Application, remote: Branch & { type?: string }) {
  if (!app.autoBuild) {
    return false
  }

  if (remote.type && remote.type !== 'branch') {
    return false
  }

  if (!remote.age) {
    return false
  }

  return isActive(remote.age)
}

function isActive(date: Date) {
  const threshold = new Date()

  // TODO: Retrieve limit from config
  const limit = 7
  threshold.setDate(threshold.getDate() - limit)
  return date.valueOf() >= threshold.valueOf()
}
