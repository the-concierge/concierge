import dockerClient from '../dockerClient'
import * as getHost from '../hosts/get'
import * as stream from 'stream'
import Docker from 'dockerode-ts'

/**
 * Attach to the logging output of a Container
 */
export default function get(container: Concierge.Container, callback: (err?: any, event?: string) => any): void {
  let request = client => getLog(client, container, callback)

  getHost.one(container.host)
    .then(dockerClient)
    .then(request)
}

function getLog(client: Docker, container: Concierge.Container, callback: (err?: any, event?: string) => any) {
  let streamCallback = (error, dataStream: stream.Readable) => {
    if (error) {
      return callback(error)
    }

    dataStream.on('data', d => {
      let str = d.toString()
      if (str.charCodeAt(0) === 1) {
        return
      }

      if (str.slice(-6, -1) === 'GET /') {
        return
      }
      callback(null, str)
    })

    dataStream.on('end', e => { })
  }

  client.getContainer(container.dockerId)
    .logs({ follow: true, stdout: true, stderr: true, tail: 0 }, streamCallback) // ?
}