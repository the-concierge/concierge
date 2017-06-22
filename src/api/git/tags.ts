import cmd from './cmd'
import appPath from './path'

export default async function getRemoteTags(application: Concierge.Application) {
  const workDir = appPath(application)
  const command = `git ls-remote --tags --heads`
  const result = await cmd(application, workDir, command)

  const tags = result
    .split('\n')
    .map(raw => {
      const split = raw.split('/')
      const tag = split.splice(-1)[0]
      const type = split.splice(-1)[0] === 'heads' ? 'branch' : 'tag'
      return { type, tag }
    })
    .filter(tag => !!tag.tag)
  return tags
}