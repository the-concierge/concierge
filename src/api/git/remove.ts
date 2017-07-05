import cmd from './cmd'
import appPath from './path'

export default async function remove(application: Concierge.Application) {
  // Working directory for removing is not relevant
  const workDir = __dirname

  const path = appPath(application)
  const command = `rm -rf ${path}`
  const result = await cmd(application, workDir, command)
  return result
}