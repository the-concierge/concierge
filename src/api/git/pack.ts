import cmd from './cmd'
import appPath from './path'
import * as tar from 'tar-fs'

const sentinal: { [appId: number]: boolean } = {}

/**
 * ref format:
 * - refs/heads/branch-name
 * - refs/tags/tag-name
 */
export default async function refToStream(
  application: Schema.Application,
  sha: string
): Promise<NodeJS.ReadableStream> {
  const id = Number(application.id)
  const isBusy = !!sentinal[id]
  if (isBusy) {
    const err: any = new Error(`Unable to pack: Application folder is busy`)
    err.code = 'E_REPOBUSY'
    throw err
  }

  sentinal[id] = true
  const workDir = appPath(application)

  try {
    await cmd(application, workDir, `git fetch origin ${sha} --depth=1`)
    await cmd(application, workDir, `git checkout ${sha}`)
  } catch (ex) {
    sentinal[id] = false
    throw new Error(`Failed to pack ${sha}: ${ex.message || ex}`)
  }

  const stream = tar.pack(workDir)

  const resetSentinal = () => {
    sentinal[id] = false
  }

  stream.on('close', resetSentinal)
  stream.on('end', resetSentinal)
  stream.on('error', resetSentinal)
  return stream
}
