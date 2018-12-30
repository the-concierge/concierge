import cmd from './cmd'
import appPath from './path'

export default async function clone(application: Schema.Application) {
  // Working directory for cloning is not relevant
  const workDir = __dirname

  const path = appPath(application)
  const command = `git clone ${application.repository} ${path} --depth=1`
  const result = await cmd(application, workDir, command)
  return result
}
