import pack from '../git/pack'
import docker from '../docker'
import * as getHost from '../hosts/db'

export default async function buildImage(application: Concierge.Application, ref: string, tag: string, hostId?: number) {
  const host = hostId
    ? await getHost.getOne(hostId)
    : await getAvailableHost()

  const client = docker(host)
  const stream = await pack(application, ref)

  const buildPromise = new Promise((resolve, reject) => {
    client.buildImage(stream, { t: tag, forcerm: true, nocache: true }, async (err, buildStream: NodeJS.ReadableStream) => {
      if (err) {
        return reject(err)
      }

      handleBuildStream(buildStream)
        .then(res => resolve(res))
        .catch(res => reject(res))
    })
  })

  return buildPromise
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
function handleBuildStream(stream: NodeJS.ReadableStream) {
  const buildResponses: object[] = []
  let previousMessage = ''
  const promise = new Promise((resolve, reject) => {
    stream.on('data', (data: Buffer) => {
      const msg = data.toString()
      const json = tryParse(previousMessage + msg)
      if (!json) {
        previousMessage += msg
        return
      }

      buildResponses.push(json)
      previousMessage = ''
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

function tryParse(message: string) {
  try {
    return JSON.parse(message)
  } catch (ex) {
    return
  }
}