import cmd from './cmd'
import appPath from './path'

export default async function clone(application: Concierge.Application) {
  // Working directory for cloning is not relevant
  const workDir = __dirname

  const path = appPath(application)
  const command = `git clone ${application.repository} ${path}`
  const result = await cmd(application, workDir, command)
  return result
}
