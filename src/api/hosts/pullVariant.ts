
import getDockerClient from '../dockerClient'
import * as emitter from '../events/emitter'

/**
 * Pull an Image (variant) from the Registry to a Host
 */
export default async function pullVariant(host: Concierge.Host, fullDockerImageName: string) {
  const result = await pullFromRegistry(host, fullDockerImageName)
  return result
}

function pullFromRegistry(host: Concierge.Host, image: string) {
  const client = getDockerClient(host)
  emitter.host(host.hostname, `Attempting to pull image '${image}'`)
  let logPrefix = '[PULL:' + host.hostname + ' <-- ' + image + '] '

  return new Promise((resolve, reject) => {
    function onProgress(event) {
      log.debug(logPrefix + JSON.stringify(event))
    }

    function onFinished(err, output) {
      if (err) {
        let errorLog = logPrefix + JSON.stringify(err)
        emitter.host(host.hostname, `Failed to pull image '${image}': ${err}`)
        log.debug(errorLog)
        return reject(errorLog)
      }
      log.debug(logPrefix + JSON.stringify(output))
      log.debug(logPrefix + 'DONE')
      emitter.host(host.hostname, `Successfully pulled image '${image}'`)
      resolve({
        host: host,
        result: output
      } as any)
    }

    client.pull(image, {}, (error, stream) => {
      if (error) {
        return reject(logPrefix + JSON.stringify(error))
      }

      client.modem.followProgress(stream, onFinished, onProgress)
    })
  })
}