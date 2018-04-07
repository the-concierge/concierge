import { Branch, State } from '../types'
import * as db from '../db'
import { checkout } from '../checkout'
import { buildImage } from '../build-image'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'

export type StrictBranch = Branch & { age: Date }

type QueueItem = StrictBranch & { app: Concierge.Application; state: State }

class BuildQueue {
  queue: QueueItem[] = []

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

  async add(app: Concierge.Application, remote: StrictBranch) {
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

  private build = async (item: QueueItem) => {
    try {
      const app = item.app
      const refSlug = slug(item.ref)
      const buildTag = `${app.label}:${refSlug}`

      // Stage: checkout:pre
      /**
       * TODO: Move checkout step here
       * Pass tarball to buildImage
       * e.g:
       * const buildContext = await pack(app, item.sha)
       * const job = await buildImage(job, buildTag)
       */
      const context = await checkout(app, item.sha)
      // Stage: checkout:post

      // Stage: build:pre
      const buildJob = await buildImage(app, context, buildTag)

      await updateRemote(item, State.Building)
      const result = await buildJob.build
      // Stage: build:post
      // Stage: success

      await updateRemote(item, State.Successful, { imageId: result.imageId })
    } catch (ex) {
      if (ex.code === 'E_REPOBUSY') {
        // If the repository on disk is busy, try this repo again in the next poll
        await updateRemote(item, State.Waiting)
        return
      }

      // Stage: fail
      // The build has failed -- we won't re-add it to the queue
      await updateRemote(item, State.Failed)
    } finally {
      // Stage: complete
    }
  }
}

const queue = new BuildQueue()

export default queue

async function updateRemote(
  item: QueueItem,
  state: State,
  props: Partial<Concierge.ApplicationRemote> = {}
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

function emit(item: QueueItem, state: State, imageId?: string) {
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

/**
 * Environment variables passed into each step:
 * CONCIERGE_REPO: Git repository url
 * CONCIERGE_APP: Application name
 * CONCIERGE_LABEL: Application label (Used to generate image tag)
 * CONCIERGE_REFTYPE: Git ref type, "branch" or "tag"
 * CONCIERGE_REF: Git ref - Branch or tag name
 * CONCIERGE_SHA: Git SHA
 * CONCIERGE_IMAGE_TAG: Docker tag
 * CONCIERGE_IMAGE_ID Docker image ID
 * CONCIERGE_STATUS ("Successful", "Failed")
 */
