import dockerClient from '../dockerClient'
import * as getHost from '../hosts/get'
import * as stream from 'stream'
import Docker from 'dockerode-ts'

/**
 * Retrieve the logs from a Container
 */
export default function get(container: Concierge.Container): Promise<any> {
  let request = (client: Docker) => getLog(client, container)

  return getHost.one(container.host)
    .then((host: Concierge.Host) => dockerClient(host, 500))
    .then(request)
}

function getLog(client: Docker, container: Concierge.Container) {
  let promise = new Promise((resolve, reject) => {
    let output = ''
    let append = data => {
      let str = data.toString()
      if (str.slice(-6, -1) === 'GET /') {
        return
      }

      output += str
    }

    let callback = (error, dataStream) => {
      if (error) {
        return reject(error)
      }

      // Demulitplexing the stream removes control characters from the output
      let stdout = new stream.PassThrough()
      let stderr = new stream.PassThrough()
      client.modem.demuxStream(dataStream, stdout, stderr)

      stdout.on('data', append)
      stderr.on('data', append)
      dataStream.on('end', () => resolve(output as any))
    }

    client.getContainer(container.dockerId)
      .logs({ follow: false, stdout: true, stderr: true }, callback) // ?
  })

  return promise
}
