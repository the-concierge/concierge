import { Branch, State } from '../types'
import * as db from '../db'
import build from '../build'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'

type QueueItem = Branch & { app: Concierge.Application }

class BuildQueue {
  queue: QueueItem[] = []
  builds: QueueItem[] = []

  // TODO: Retrieve from DB configuration
  maxConcurrent = 2

  constructor() {
    this.init()
  }

  init() {
    this.poll()
  }

  add(app: Concierge.Application, remote: Branch) {
    const existing = this.queue.find(item => item.app.id === app.id && item.ref === remote.ref)

    // The SHA for the remote may have updated while we were waiting to start
    // Do not build the original SHA and leave its position in the queue
    if (existing) {
      existing.sha = remote.sha
      log.debug(`[${app.name}] Updated waiting job '${remote.ref}'`)
      this.emit(existing, State.Waiting)
      return
    }

    log.debug(`[${app.name}] Add job to build queue '${remote.ref}'`)
    const item = { ...remote, app }
    this.queue.push(item)
    this.emit(item, State.Waiting)
  }

  private poll = async () => {
    try {
      if (this.builds.length >= this.maxConcurrent) {
        return
      }

      const nextBuild = this.queue.shift()
      if (!nextBuild) {
        return
      }

      // We must 'fire and forget' this item to allow paralell builds
      this.build(nextBuild)
    } finally {
      setTimeout(() => this.poll(), 500)
    }
  }

  emit = (item: QueueItem, state: State, imageId?: string) => {
    buildStatus(item.app.id, {
      ...item,
      applicationId: item.app.id,
      state,
      imageId,
      remote: item.ref,
      age: item.age ? item.age.toISOString() : undefined,
      seen: item.seen ? item.seen.toISOString() : undefined,
      app: undefined,
      ref: undefined
    })
  }

  build = async (item: QueueItem) => {
    const app = item.app

    try {
      this.builds.push(item)
      const refSlug = slug(item.ref)
      const buildTag = `${app.label}:${refSlug}`

      const buildJob = await build(app, item.sha, buildTag)
      this.emit(item, State.Building)
      await db.updateRemote(app.id, item.ref, { state: State.Building, sha: item.sha })

      const result = await buildJob.build
      this.emit(item, State.Successful, result.imageId)
      await db.updateRemote(app.id, item.ref, {
        state: State.Successful,
        sha: item.sha,
        imageId: result.imageId
      })

      this.builds = this.builds.filter(build => build !== item)
      return
    } catch (ex) {
      // We need to remove the build from the current builds list
      this.builds = this.builds.filter(build => build !== item)

      if (ex.code === 'E_REPOBUSY') {
        // If the repository on disk is busy, try this repo again in the next poll
        this.queue.unshift(item)
        this.emit(item, State.Waiting)
        await db.updateRemote(app.id, item.ref, { state: State.Waiting, sha: item.sha })
        return
      }

      // The build has failed -- we won't re-add it to the queue
      this.emit(item, State.Failed)
      await db.updateRemote(app.id, item.ref, { state: State.Failed, sha: item.sha })
    }
  }
}

const queue = new BuildQueue()

export default queue
