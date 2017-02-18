import dockerClient from '../dockerClient'

/**
 * Listen to a Host's log stream
 */
export default function get(host: Concierge.Host, callback: (error?: any, event?: string) => void) {
  let client = dockerClient(host)

  client.getEvents({}, (err, dataStream: NodeJS.ReadableStream) => {
    if (err) {
      return callback(err)
    }
    dataStream.on('data', data => callback(null, data.toString()))
  })
}