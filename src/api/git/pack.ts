import cmd from './cmd'
import appPath from './path'
import * as tar from 'tar-fs'

const sentinal: { [appId: number]: boolean } = {}

/**
 * ref format:
 * - refs/heads/branch-name
 * - refs/tags/tag-name
 */
export default async function refToStream(application: Concierge.Application, ref: string): Promise<NodeJS.ReadableStream> {
  const id = Number(application.id)
  const isBusy = !!sentinal[id]
  if (!isBusy) {
    throw new Error(`Unable to pack: Application folder is busy`)
  }

  sentinal[id] = true
  const workDir = appPath(application)

  try {
    await cmd(application, workDir, `git fetch origin ${ref}`)
    await cmd(application, workDir, `git checkout ${ref}`)
  } catch (ex) {
    sentinal[id] = false
    throw new Error(`Failed to pack ${ref}: ${ex.message || ex}`)
  }

  const stream = tar.pack(workDir)
  stream.on('close', () => sentinal[id] = false)
  return stream
}