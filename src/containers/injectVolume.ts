import * as log from '../logger'
import removeDirectory from '../ssh/removeDirectory'
import makeDirectory from '../ssh/makeDirectory'
import writeFile from '../ssh/writeFile'
import * as getHost from '../hosts/get'
import exec from '../ssh/exec'
import getVolumePath from '../hosts/volumePath'
import removeFile from '../ssh/removeFile'
import { posix } from 'path'

/**
 * Unpack the contents of a tar file into the container
 */
export default async function inject(container: Concierge.Container, volumeData: Buffer) {
  if (!container.host) {
    throw new Error('Unable to inject database: No host information')
  }

  const host = await getHost.one(container.host)

  // Generate a temporary filename for the archive
  const tarFilename = posix.join(
    getVolumePath(host),
    `${container.subdomain}_${Date.now().valueOf()}.tar`
  )

  // Get the destination path on the Container
  const destination = posix.join(
    getVolumePath(host),
    container.subdomain
  )

  // Clear the path for the archive contents
  try {
    removeDirectory(host, container.subdomain)
  } catch (ex) {
    log.warn(`[VOLUMEINJECT] ${ex}`)
  }

  // Finally unpack the contents...
  await (makeDirectory(host, container.subdomain))

  // Place the archive at the destination host+path
  await putTar(host, tarFilename, volumeData)

  // Execute the unpack command
  await unpackTar(host, destination, tarFilename)

  // Remove the evidence
  await removeTar(host, tarFilename)
  return true
}

async function putTar(host: Concierge.Host, filename: string, tar: Buffer) {
  const result = await writeFile(host, filename, tar)
  return result
}

async function unpackTar(host: Concierge.Host, destination: string, filename: string) {
  // The directory should already exist at this point. No need to create it before unpacking.
  const command = `tar -C ${destination} --strip-components 1 -xf ${filename}`
  const result = await exec(host, command)
  return result
}

async function removeTar(host: Concierge.Host, filename: string) {
  const result = await removeFile(host, filename)
  return result
}
