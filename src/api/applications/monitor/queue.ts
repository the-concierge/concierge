import { Branch, State } from '../types'
import * as db from '../db'
import build from '../build'
import slug from './slug'

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
      return
    }

    log.debug(`[${app.name}] Add job to build queue '${remote.ref}'`)
    this.queue.push({ ...remote, app })
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

      const app = nextBuild.app
      try {
        this.builds.push(nextBuild)
        const refSlug = slug(nextBuild.ref)
        const buildTag = `${app.label}:${refSlug}`
        const buildJob = await build(app, nextBuild.sha, buildTag)

        const result = await buildJob.build
        await db.updateRemote(
          app.id,
          nextBuild.ref,
          State.Successful,
          nextBuild.sha,
          result.imageId
        )

        this.builds = this.builds.filter(build => build !== nextBuild)
        return
      } catch (ex) {
        // If the repository on disk is busy, try this repo again in the next poll
        // TODO: Ensure this doesn't cause an endless loop

        if (ex.code === 'E_REPOBUSY') {
          this.queue.unshift(nextBuild)
          await db.updateRemote(app.id, nextBuild.ref, State.Waiting, nextBuild.sha)
          return
        }
        // The build has failed
        await db.updateRemote(app.id, nextBuild.ref, State.Failed, nextBuild.sha)
      }
    } finally {
      setTimeout(() => this.poll(), 1000)
    }
  }
}

const queue = new BuildQueue()

export default queue
