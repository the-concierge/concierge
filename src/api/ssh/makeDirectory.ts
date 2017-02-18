import { posix } from 'path'
import getSshClient from '../ssh/getClient'
import getVolumePath from '../hosts/volumePath'
import * as log from '../../logger'

/**
 * Create a directory on a Host
 */
export default async function makeDirectory(host: Concierge.Host, newDirectory: string) {
  newDirectory = newDirectory || ''

  const newPath = posix.join(
    await getVolumePath(host),
    newDirectory
  )

  const client = await getSshClient(host)
  return await mkdir(client, newPath)
}

function mkdir(client, newPath: string) {
  const promise = new Promise<boolean>((resolve, reject) => {

    function mkdirHandler(error) {
      client.end()
      if (error) {
        return reject('[MKDIR] Failed to create directory: ' + error)
      }
      resolve(true)
    }

    log.debug('MKDIR: ' + newPath)
    client.exec('mkdir ' + newPath, mkdirHandler)
  })

  return promise
}