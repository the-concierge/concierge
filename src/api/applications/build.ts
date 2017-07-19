import * as fs from 'fs'
import * as path from 'path'
import pack from '../git/pack'
import docker from '../docker'
import { build as emitBuild } from '../stats/emitter'
import * as getHost from '../hosts/db'

const logBasePath = path.resolve(__dirname, '..', '..', '..', 'logs')

export default async function buildImage(application: Concierge.Application, sha: string, tag: string, hostId?: number) {
  const host = hostId
    ? await getHost.getOne(hostId)
    : await getAvailableHost()

  const client = docker(host)
  const stream = await pack(application, sha)
  await createApplicationLogPath(application)

  const logFile = getLogFilename(application, tag)

  const options: any = {
    t: tag,
    forcerm: true,
    nocache: true,
    dockerfile: application.dockerfile || 'Dockerfile'
  }

  client.buildImage(stream, options, async (err, buildStream: NodeJS.ReadableStream) => {
    const buildName = `${application.id}/${tag}`
    if (err) {
      appendAsync(logFile, err.message || err)
      emitBuild(buildName, `Failed to start build: ${err.message || err}`)
      return
    }

    handleBuildStream(buildName, buildStream, logFile)
  })
}

function getLogFilename(app: Concierge.Application, ref: string) {
  const now = new Date()
  const date = `${now.getFullYear()}${now.getMonth()}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
  const filename = `${date}__${ref}.log`
    .split('/')
    .join('_')

  const logPath = path.resolve(logBasePath, app.id.toString(), filename)
    .replace('refs/heads/', '')
    .replace('refs/tags/', '')

  log.debug(`Using log file: ${logPath}`)
  return logPath
}

async function getAvailableHost() {
  const hosts = await getHost.getAll()
  const host = hosts[0]

  if (!host) {
    throw new Error(`Unable to build image: No hosts available`)
  }

  return host
}

/**
 * TODO:
 * - Emit build events over web socket (application, ref, message)
 * - Have front-end monitor build events for application + ref
 */
function handleBuildStream(buildName: string, stream: NodeJS.ReadableStream, logFile: string) {
  const buildResponses: string[] = []

  const promise = new Promise((resolve, reject) => {
    stream.on('data', (data: Buffer) => {
      const msg = data.toString()
      const output = tryParse(msg)

      const text = output.stream || output.errorDetail || output
      if (!text) {
        return
      }

      buildResponses.push(msg)
      emitBuild(buildName, text.trim())
      appendAsync(logFile, msg + '\n')
    })

    stream.on('end', () => {
      const hasErrors = buildResponses.some(res => res.hasOwnProperty('errorDetail'))
      if (hasErrors) {
        return reject(buildResponses)
      }

      resolve(buildResponses)
    })
  })

  return promise
}

function tryParse(text: string): { stream?: string, errorDetail?: string } & string {
  try {
    const json = JSON.parse(text.trim())
    return json
  } catch (_) {
    return text
  }
}

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

async function createApplicationLogPath(application: Concierge.Application) {
  return mkdirAsync(path.resolve(logBasePath, application.id.toString()))
}

function mkdirAsync(folder: string) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(folder, err => {
      if (err) {
        const msg = (err.message || err) as string
        if (msg.indexOf('EEXIST') > -1) {
          return resolve()
        }
        return reject(err)
      }
      resolve()
    })
  })
}