import { Branch, State } from '../types'
import * as db from '../db'
import { buildImage } from '../build-image'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'
import { getConfig } from '../../configuration/db'

export type StrictBranch = Branch & { age: Date }

export type BuildQueueItem = StrictBranch & { app: Schema.Application; state: State }

class BuildQueue {
  queue: BuildQueueItem[] = []

  // TODO: Retrieve from DB configuration
  // This will eventually be derived from "Hosts"
  // Hosts config will determine how many concurrent builds they support
  // "Host.capacity" will become ultimately mean "Host.concurrentBuildLimit"
  // At the moment we just support builds on "localhost"
  maxConcurrent = 2

  constructor() {
    this.init()
  }

  init() {
    this.poll()
  }

  async add(app: Schema.Application, remote: StrictBranch) {
    const existingItem = this.queue.find(item => item.app.id === app.id && item.ref === remote.ref)

    if (!existingItem) {
      log.debug(`[${app.name}] Add job to build queue '${remote.ref}'`)
      const item = { ...remote, app, state: State.Waiting }
      this.queue.push(item)
      await updateRemote(item, State.Waiting)
      return
    }

    if (existingItem.sha === remote.sha) {
      // If we are already aware of the SHA and it is 'dealt with', do nothing
      switch (existingItem.state) {
        case State.Building:
        case State.Waiting:
          return
      }
      // Fall through for 'non-dealt with' remotes and re-build them
    }

    // The SHA for the remote may have updated while we were waiting to start
    // Do not build the original SHA and leave its position in the queue
    existingItem.sha = remote.sha
    log.debug(`[${app.name}] Updated waiting job '${remote.ref}'`)
    await updateRemote(existingItem, State.Waiting)
  }

  private poll = async () => {
    try {
      const config = await getConfig()
      this.maxConcurrent = config.maxConcurrentBuilds

      const inProgress = this.queue.filter(
        item => item.state === State.Building || item.state === State.Started
      )

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

  private build = async (item: BuildQueueItem) => {
    const refSlug = slug(item.ref)
    const buildTag = `${item.app.label}:${refSlug}`

    // Not awaiting is intentional here
    // If we awaited, we would only perform one build at a time
    await updateRemote(item, State.Started)
    buildImage({
      app: item.app,
      ref: item.ref,
      sha: item.sha,
      tag: buildTag,
      setState: (state, props) => updateRemote(item, state, props)
    })
  }
}

export const queue = new BuildQueue()

async function updateRemote(
  item: BuildQueueItem,
  state: State,
  props: Partial<Schema.ApplicationRemote> = {}
) {
  emit(item, state, props.imageId)
  item.state = state
  await db.updateRemote(item.app.id, item.ref, {
    state,
    sha: item.sha,
    age: item.age.toISOString(),
    ...props
  })
}

function emit(item: BuildQueueItem, state: State, imageId?: string) {
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
