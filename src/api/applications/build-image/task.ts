import { State } from '../types'
import { spawn } from 'child_process'
import appPath from '../../git/path'
import { Task } from '../../tasks'

export type TaskResult = {
  code: number
  output: string[]
}

export interface TaskOpts {
  app: Schema.Application
  ref: string
  sha: string
  imageId?: string
  imageTag?: string
  state: State
  emit?: (events: string[]) => Promise<void>
}

export function getCommands(task: Task | null, stage: keyof Task) {
  if (!task) {
    return []
  }

  const commands = task[stage]
  if (!Array.isArray(commands)) {
    return []
  }

  return commands
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

export function executeTask(opts: TaskOpts, command: string) {
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
    proc.on('close', code => resolve({ code, output }))
  })
}
