import * as fs from 'fs'
import * as path from 'path'
import docker from '../../docker'
import { build as emitBuild } from '../../stats/emitter'
import * as getHost from '../../hosts/db'
import { checkout } from '../checkout'
import push from './push'
import { handleBuildStream, createLogFile } from './log'
import { executeTask, getCommands, TaskOpts } from './task'
import App = Concierge.Application
import { State } from '../types'

/**
 * This module will:
 * - Persist logs to a logfile
 * - Emit logs over websockets
 * - Checkout the requested SHA
 * - Attempt to build a Docker image
 * - Execute tasks in concierge.yml file
 */

type Emitter = (events: string[]) => void

export interface BuildOptions {
  app: Concierge.Application

  /** Docker tag */
  tag: string

  /** Git SHA */
  sha: string

  /** Git Branch or Tag name */
  ref: string

  /** ID of the host to perform the build on */
  hostId?: number

  /** Notify the caller that the state of the build has changed */
  setState: (state: State, props?: Partial<Concierge.ApplicationRemote>) => Promise<any>
}

export async function buildImage(opts: BuildOptions) {
  const logFile = await createLogFile(opts.app, opts.tag)
  const buildId = path.basename(logFile)

  const logState = {
    stage: 1,
    name: 'checkout'
  }

  const logs: { [stage: number]: { step: string; logs: string[] } } = {}

  const emit = async (events: string[]) => {
    const { stage, name } = logState
    if (!logs[stage]) {
      logs[stage] = { step: name, logs: [] }
    }

    logs[stage].logs.push(...events)
    events.forEach(ev => emitBuild(buildId, ev))
  }

  // We declare these outside of the try block due to needing these in the catch/finally blocks
  const failCommands: string[] = []
  const completeCommands: string[] = []

  const taskOpts: TaskOpts = {
    app: opts.app,
    ref: opts.ref,
    sha: opts.sha,
    state: State.Building
  }

  const setState = (
    name: string,
    state: State | null,
    props?: Partial<Concierge.ApplicationRemote>
  ) => {
    logState.stage++
    logState.name = name

    if (state === taskOpts.state || !state) {
      return
    }

    taskOpts.state = state
    return opts.setState(state, props)
  }

  const execCmd = async (cmd: string) => {
    await setState(cmd, null)
    const res = await executeTask(taskOpts, cmd)
    emitBuild(buildId, `> ${cmd}`)
    emit(res.output)
  }

  try {
    const context = await checkout(opts.app, opts.sha)

    failCommands.push(...getCommands(context.task, 'fail'))
    completeCommands.push(...getCommands(context.task, 'complete'))

    for (const cmd of getCommands(context.task, 'checkout')) {
      await execCmd(cmd)
    }

    await setState('building', State.Building)
    const buildResult = await startDockerBuild(
      context.stream,
      opts.app,
      opts.tag,
      emit,
      opts.hostId
    )

    taskOpts.imageId = buildResult.imageId
    taskOpts.imageTag = opts.tag

    await setState('successful', State.Successful, { imageId: buildResult.imageId! })
    for (const cmd of getCommands(context.task, 'success')) {
      await execCmd(cmd)
    }
  } catch (ex) {
    await setState('failed', State.Failed)
    for (const cmd of failCommands) {
      await execCmd(cmd)
    }
  } finally {
    await setState('completed', taskOpts.state)
    for (const cmd of completeCommands) {
      await execCmd(cmd)
    }

    // Remove empty log entries
    Object.keys(logs).forEach(id => {
      const obj = logs[Number(id)]
      obj.logs = obj.logs.filter(entry => !!entry)
    })

    const finalLog = Object.keys(logs).map((id, i) => {
      const log = logs[Number(id)]
      return {
        id: i + 1,
        step: log.step,
        logs: log.logs
      }
    })

    await appendAsync(logFile, JSON.stringify(finalLog, null, 2))
  }
}

async function startDockerBuild(
  stream: NodeJS.ReadableStream,
  app: App,
  tag: string,
  emit: Emitter,
  hostId?: number
) {
  const host = hostId ? await getHost.getOne(hostId) : await getAvailableHost()
  const client = docker(host)
  const options: any = {
    t: tag,
    forcerm: true,
    nocache: true,
    dockerfile: app.dockerfile || 'Dockerfile'
  }

  return new Promise<{ responses: BuildEvent[]; imageId?: string }>((resolve, reject) => {
    client.buildImage(stream, options, async (err, buildStream: NodeJS.ReadableStream) => {
      if (err) {
        reject(err)
        emit([`Failed to start build: ${err.message || err}`])
        return
      }

      try {
        const responses = await handleBuildStream(buildStream, emit)
        const imageId = getImageId(responses)
        resolve({ responses, imageId })
        push(host, tag)
      } catch (err) {
        reject(err)
      }
    })
  })
}

async function getAvailableHost() {
  /**
   * TODO: Iterate over hosts and find first host with available capacity
   */
  const [host] = await getHost.getAll()

  if (!host) {
    throw new Error(`Unable to build image: No hosts available`)
  }

  return host
}

type BuildEvent = { stream: string; aux?: { ID: string }; errorDetail: string }

function appendAsync(file: string, content: any) {
  return new Promise<void>((resolve, reject) => {
    fs.appendFile(file, content, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

function getImageId(buildResponses: BuildEvent[]): string | undefined {
  for (const response of buildResponses) {
    if (!response.aux) {
      continue
    }

    return response.aux.ID
  }
  return
}
