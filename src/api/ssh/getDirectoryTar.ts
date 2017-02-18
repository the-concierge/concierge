
import { posix } from 'path'
import readFile from './readFile'
import exec from './exec'

/**
 * Pack the contents of a folder on a Host into a tar file
 * Return a promise of a Buffer
 */

export default async function getDirectoryAsTarBuffer(host: Concierge.Host, directory: string): Promise<Buffer> {
  const tempFile = await createTarFile(host, directory)
  const buffer = await readFile(host, tempFile)

  // TODO: Ensure is deleted?
  await removeTarFile(host, tempFile)

  return buffer
}

async function createTarFile(host: Concierge.Host, directory: string) {
  const baseFolder = posix.resolve(directory, '..')
  const lastFolder = directory.split(posix.sep).slice(-1)[0]
  const temporaryFile = `${Date.now().valueOf().toString()}.tar`

  // Reduce the folder nesting in the archive to one folder
  const command = `(cd ${baseFolder} && tar cf - ${lastFolder} > ${temporaryFile})`

  await exec(host, command)
  return posix.join(baseFolder, temporaryFile)
}

async function removeTarFile(host: Concierge.Host, filename: string) {
  const command = `rm ${filename}`
  const result = await exec(host, command)
  return result
}