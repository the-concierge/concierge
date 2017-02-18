import gitApi from './gitApi'
import appPath from './appPath'
import gitCmd from './gitCmd'

/**
 * Git clone the Application repository
 */
export default async function clone(application: Concierge.Application) {
  // Working directory for clone is not relevant
  const workingDir = __dirname

  const targetPath = appPath(application)
  const api = gitApi(application.gitApiType)
  const repository = api.getRepository(application)
  const command = `git clone ${repository} ${targetPath}`
  const result = await gitCmd(application, workingDir, command)
  return result
}