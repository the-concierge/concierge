import { Branch, State } from '../types'
import * as db from '../db'
import build from '../build'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'

export type StrictBranch = Branch & { age: Date }

type QueueItem = StrictBranch & { app: Concierge.Application; state: State }

class BuildQueue {
  queue: QueueItem[] = []

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

    if (!existingItem) {
      log.debug(`[${app.name}] Add job to build queue '${remote.ref}'`)
      const item = { ...remote, app, state: State.Waiting }
      this.queue.push(item)
      await this.updateRemote(item, State.Waiting)
      return
    }

    if (existingItem.sha === remote.sha) {
      // If we are already aware of the SHA and it is 'dealt with', do nothing
      switch (existingItem.state) {
        case State.Building:
        case State.Successful:
        case State.Waiting:
          return
      }
      // Fall through for 'non-dealt with' remotes and re-build them
    }

    // The SHA for the remote may have updated while we were waiting to start
    // Do not build the original SHA and leave its position in the queue
    existingItem.sha = remote.sha
    log.debug(`[${app.name}] Updated waiting job '${remote.ref}'`)
    await this.updateRemote(existingItem, State.Waiting)
  }

  private async updateRemote(
    item: QueueItem,
    state: State,
    props: Partial<Concierge.ApplicationRemote> = {}
  ) {
    this.emit(item, state, props.imageId)
    item.state = state
    await db.updateRemote(item.app.id, item.ref, {
      state,
      sha: item.sha,
      age: item.age.toISOString(),
      ...props
    })
  }

  private poll = async () => {
    try {
      const inProgress = this.queue.filter(item => item.state === State.Building)
      const waiting = this.queue.filter(item => item.state === State.Waiting)
      if (inProgress.length >= this.maxConcurrent) {
        return
      }

      const nextBuild = waiting[0]
      if (!nextBuild) {
        return
      }

      // We must 'fire and forget' this item to allow paralell builds
      this.build(nextBuild)
    } finally {
      setTimeout(() => this.poll(), 500)
    }
  }

  private emit = (item: QueueItem, state: State, imageId?: string) => {
    buildStatus(item.app.id, {
      applicationId: item.app.id,
      sha: item.sha,
      state,
      imageId,
      remote: item.ref,
      age: item.age.toISOString(),
      seen: item.seen ? item.seen.toISOString() : undefined
    })
  }

  private build = async (item: QueueItem) => {
    const app = item.app

    try {
      const refSlug = slug(item.ref)
      const buildTag = `${app.label}:${refSlug}`

      const buildJob = await build(app, item.sha, buildTag)

      const props: any = { state: State.Building, sha: item.sha }
      if (item.age) {
        props.age = item.age.toISOString()
      }

      await this.updateRemote(item, State.Building)
      const result = await buildJob.build
      await this.updateRemote(item, State.Successful, { imageId: result.imageId })
      return
    } catch (ex) {
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
