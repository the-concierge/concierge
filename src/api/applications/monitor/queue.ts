import { Branch, State } from '../types'
import * as db from '../db'
import { checkout } from '../checkout'
import { buildImage } from '../build-image'
import slug from './slug'
import { buildStatus } from '../../stats/emitter'
import { spawn } from 'child_process'
import appPath from '../../git/path'
import { Task } from '../../tasks'

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
    const app = item.app
    const refSlug = slug(item.ref)
    const buildTag = `${app.label}:${refSlug}`
    const failCommands: string[] = []
    const completeCommands: string[] = []

    const opts: TaskOpts = {
      app,
      ref: item.ref,
      sha: item.sha,
      state: State.Building
    }

    try {
      // Stage: checkout
      const { stream, task } = await checkout(app, item.sha)

      failCommands.push(...getCommands(task, 'fail'))
      completeCommands.push(...getCommands(task, 'complete'))

      for (const cmd of getCommands(task, 'checkout')) {
        await executeTask(opts, cmd)
      }

      const buildJob = await buildImage(app, stream, buildTag)

      await updateRemote(item, State.Building)
      const result = await buildJob.build
      opts.imageId = result.imageId
      opts.imageTag = buildTag
      opts.state = State.Successful

      // Stage: success
      for (const cmd of getCommands(task, 'success')) {
        await executeTask(opts, cmd)
      }

      await updateRemote(item, State.Successful, { imageId: result.imageId })
    } catch (ex) {
      if (ex.code === 'E_REPOBUSY') {
        // If the repository on disk is busy, try this repo again in the next poll
        await updateRemote(item, State.Waiting)
        return
      }

      // Stage: fail
      // The build has failed -- we won't re-add it to the queue
      opts.state = State.Failed
      for (const cmd of failCommands) {
        await executeTask(opts, cmd)
      }
      await updateRemote(item, State.Failed)
    } finally {
      // Stage: complete
      for (const cmd of completeCommands) {
        await executeTask(opts, cmd)
      }
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

type TaskResult = {
  code: number
  output: string[]
}

interface TaskOpts {
  app: Concierge.Application
  ref: string
  sha: string
  imageId?: string
  imageTag?: string
  state: State
}

function getCommands(task: Task | null, stage: keyof Task) {
  if (!task) {
    return []
  }

  const commands = task[stage]
  if (!Array.isArray(commands)) {
    return []
  }

  return commands
}

function executeTask(opts: TaskOpts, command: string) {
  const env = {
    CONCIERGE_REPO: opts.app.repository,
    CONCIERGE_APP: opts.app.name,
    CONCIERGE_LABEL: opts.app.label,
    CONCIERGE_REF: opts.ref,
    CONCIERGE_SHA: opts.sha,
    CONCIERGE_IMAGE_TAG: opts.imageTag || '',
    CONCIERGE_IMAGE_ID: opts.imageId || '',
    CONCIERGE_STATUS: State[opts.state]
  }

  const cwd = appPath(opts.app)
  return new Promise<TaskResult>(resolve => {
    const [cmd, ...args] = command.split(' ').filter(cmd => !!cmd)
    const proc = spawn(cmd, args, {
      cwd,
      env,
      shell: true
    })

    const output: string[] = []
    proc.stdout.on('data', data => {
      output.push(...data.toString().split('\n'))
    })

    proc.stderr.on('error', (err: any) => output.push(err.message || err))

    proc.on('close', code => {
      resolve({
        code,
        output
      })
    })
  })
}

/**
 * Environment variables passed into each step:
 * CONCIERGE_REPO: Git repository url
 * CONCIERGE_APP: Application name
 * CONCIERGE_LABEL: Application label (Used to generate image tag)
 * CONCIERGE_REF: Git ref - Branch or tag name
 * CONCIERGE_SHA: Git SHA
 * CONCIERGE_IMAGE_TAG?: Docker tag
 * CONCIERGE_IMAGE_ID?: Docker image ID
 * CONCIERGE_STATUS ("Successful", "Failed")
 */
