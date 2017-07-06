import cmd from './cmd'
import appPath from './path'
import * as tar from 'tar-fs'

const sentinal: { [appId: number]: boolean } = {}

/**
 * ref format:
 * - refs/heads/branch-name
 * - refs/tags/tag-name
 */
export default async function refToStream(application: Concierge.Application, sha: string): Promise<NodeJS.ReadableStream> {
  const id = Number(application.id)
  const isBusy = !!sentinal[id]
  if (isBusy) {
    throw new Error(`Unable to pack: Application folder is busy`)
  }

  sentinal[id] = true
  const workDir = appPath(application)

  try {
    await cmd(application, workDir, `git fetch origin`)
    await cmd(application, workDir, `git checkout ${sha}`)
  } catch (ex) {
    sentinal[id] = false
    throw new Error(`Failed to pack ${sha}: ${ex.message || ex}`)
  }

  const stream = tar.pack(workDir)

  const resetSentinal = () => {
    log.debug(`Reset pack sentinal for '${id}'`)
    sentinal[id] = false
  }
  stream.on('close', resetSentinal)
  stream.on('end', resetSentinal)
  stream.on('error', resetSentinal)
  return stream
}