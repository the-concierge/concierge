import * as fs from 'fs'
import * as path from 'path'
import App = Concierge.Application

/**
 * Returns the name of the log file
 */
export async function createLogFile(app: App, tag: string): Promise<string> {
  await createApplicationLogPath(app)
  const logfile = getLogFilename(app, tag)
  return logfile
}

const logBasePath = path.resolve(__dirname, '..', '..', '..', '..', 'logs')

function getLogFilename(app: Concierge.Application, ref: string) {
  const now = new Date()
  const date = `${now.getFullYear()}${now.getMonth()}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
  const filename = `${date}__${ref}.json`.split('/').join('_')

  const logPath = path
    .resolve(logBasePath, app.id.toString(), filename)
    .replace('refs/heads/', '')
    .replace('refs/tags/', '')

  log.debug(`Using log file: ${logPath}`)
  return logPath
}

async function createApplicationLogPath(application: Concierge.Application) {
  return mkdirAsync(path.resolve(logBasePath, application.id.toString()))
}

export function handleBuildStream(stream: NodeJS.ReadableStream, log: (events: string[]) => void) {
  const buildResponses: BuildEvent[] = []

  const promise = new Promise<BuildEvent[]>((resolve, reject) => {
    stream.on('data', (data: Buffer) => {
      const msg = data.toString()
      const output = tryParse(msg)

      if (!Array.isArray(output)) {
        log([output])
        return
      }

      buildResponses.push(...output)

      log(output.map(o => o.stream || o.errorDetail).filter(o => !!(o || '').trim()))
    })

    stream.on('end', () => {
      const hasErrors = buildResponses.some(res => {
        return res.hasOwnProperty('errorDetail')
      })
      if (hasErrors) {
        return reject(buildResponses)
      }

      resolve(buildResponses)
    })
  })

  return promise
}

type BuildEvent = { stream: string; aux?: { ID: string }; errorDetail: string }

type ParseResult = BuildEvent[] | string

function tryParse(text: string): ParseResult {
  try {
    const json = JSON.parse(text.trim())
    return [json]
  } catch (_) {
    try {
      const split = text.trim().split('\n')
      return split.map(splitText => JSON.parse(splitText))
    } catch (__) {
      return text
    }
  }
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
