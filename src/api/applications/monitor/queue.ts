import { Branch, State } from '../types'
import * as db from '../db'
import build from '../build'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'

export type StrictBranch = Branch & { age: Date }

type QueueItem = StrictBranch & { app: Concierge.Application }

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

  async add(app: Concierge.Application, remote: StrictBranch) {
    const existingItem = this.queue.find(item => item.app.id === app.id && item.ref === remote.ref)
    const existingBuild = this.builds.find(
      item => item.app.id === app.id && item.ref === remote.ref
    )

    // If we are already building this SHA, we do not need to add it to the build queue
    if (existingBuild) {
      return
    }

    // The SHA for the remote may have updated while we were waiting to start
    // Do not build the original SHA and leave its position in the queue
    if (existingItem) {
      existingItem.sha = remote.sha
      log.debug(`[${app.name}] Updated waiting job '${remote.ref}'`)
      this.updateRemote(existingItem, State.Waiting)
      return
    }

    log.debug(`[${app.name}] Add job to build queue '${remote.ref}'`)
    const item = { ...remote, app }
    this.queue.push(item)
    this.updateRemote(item, State.Waiting)
  }

  async updateRemote(
    item: QueueItem,
    state: State,
    props: Partial<Concierge.ApplicationRemote> = {}
  ) {
    this.emit(item, state, props.imageId)
    await db.updateRemote(item.app.id, item.ref, {
      state,
      sha: item.sha,
      age: item.age.toISOString(),
      ...props
    })
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
      age: item.age.toISOString(),
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

      const props: any = { state: State.Building, sha: item.sha }
      if (item.age) {
        props.age = item.age.toISOString()
      }

      await this.updateRemote(item, State.Building)
      const result = await buildJob.build
      await this.updateRemote(item, State.Successful, { imageId: result.imageId })

      this.builds = this.builds.filter(build => build !== item)
      return
    } catch (ex) {
      // We need to remove the build from the current builds list
      this.builds = this.builds.filter(build => build !== item)

      if (ex.code === 'E_REPOBUSY') {
        // If the repository on disk is busy, try this repo again in the next poll
        this.queue.unshift(item)
        await this.updateRemote(item, State.Waiting)
        return
      }

      // The build has failed -- we won't re-add it to the queue
      await this.updateRemote(item, State.Failed)
    }
  }
}

const queue = new BuildQueue()

export default queue
