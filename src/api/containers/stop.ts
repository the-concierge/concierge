import getDockerClient from '../dockerClient'
import * as getHost from '../hosts/get'
import * as Docker from 'dockerode-ts'

/**
 * Stop a Container
 */

export default function stop(container: Concierge.Container) {
  return getHost.one(container.host)
    .then(getDockerClient)
    .then(client => client.getContainer(container.dockerId))
    .then(dockerContainer => stopContainer(dockerContainer, container))
}

function stopContainer(dockerContainer: Docker.Container, container: Concierge.Container) {
  let promise = new Promise<boolean>((resolve, reject) => {
    dockerContainer.stop((error, response) => {
      if (error) {

        // The container is already in the intended state, so we resolve true despite being an error
        if (alreadyStopped(error)) {
          return resolve(true)
        }

        return reject(error)
      }
      resolve(true)
    })
  })

  return promise
}

function alreadyStopped(message: any) {
  if (typeof message.reason !== 'string') {
    return false
  }
  return message.reason.indexOf('already stopped') >= 0
}
