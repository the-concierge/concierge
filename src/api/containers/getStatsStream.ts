import dockerClient from '../dockerClient'
import * as stream from 'stream'
import * as getHost from '../hosts/get'
import Docker from 'dockerode-ts'

export default function get(container: Concierge.Container, callback: (err?: any, stats?: any) => any, endCallback?: () => void): Promise<any> {
  let request = client => getStats(container, client, callback, endCallback)

  return getHost.one(container.host)
    .then(dockerClient)
    .then(request)
}

function getStats(container: Concierge.Container, client: Docker, callback: (err?: any, stats?: any) => any, endCallback?: () => void) {
  let stats = ''
  endCallback = endCallback || (() => { })

  let parse = data => {
    stats += data.toString()
    let parsed = tryJsonParse(stats)
    if (!parsed) {
      return
    }
    stats = ''
    callback(null, parsed)
  }

  let dataCallback = (err, data: stream.Readable) => {
    if (err) {
      return callback(err)
    }

    data.on('data', parse)
    data.on('end', endCallback)
    data.on('error', endCallback)
    data.on('abort', endCallback)
  }

  client.getContainer(container.dockerId)
    .stats(dataCallback)
}

function tryJsonParse(data: string) {
  try {
    let output = JSON.parse(data)
    return output
  } catch (ex) {
    return null
  }
}