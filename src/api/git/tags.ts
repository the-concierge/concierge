import cmd from './cmd'
import appPath from './path'
import { Branch } from '../applications/types'

export default async function getRemoteTags(application: Concierge.Application) {
  const workDir = appPath(application)
  const command = `git ls-remote --tags --heads`
  const result = await cmd(application, workDir, command)

  const ages = await getRemoteAges(application)

  const getAge = (ref: string): Date | undefined => {
    const refAge = ages.find(age => age.ref === ref)
    if (refAge) {
      return refAge.age
    }
    return undefined
  }

  const tags = result
    .split('\n')
    .filter(line => !!line.trim())
    .filter(line => line.indexOf('refs/') > 0)
    .map(raw => {
      const split = raw.split('refs/')
      const rawRef = split[1].trim()
      const sha = split[0].trim()
      const ref = rawRef.replace('heads/', '').replace('tags/', '')
      const type = rawRef.startsWith('heads/') ? 'branch' : 'tag'
      const age = type === 'branch' ? getAge(ref) : undefined
      return { type, ref, sha, age } as Branch & { type: typeof type }
    })
    .filter(ref => !!ref.ref)
    .filter(ref => !ref.ref.endsWith('^{}'))

  return tags
}

async function getRemoteAges(app: Concierge.Application) {
  const cwd = appPath(app)

  // We need to update our local version of remotes before using the for-each-ref command
  await cmd(app, cwd, `git remote update origin --prune`)

  const command = `git`
  const args = [
    'for-each-ref',
    '--sort=-committerdate',
    '--format=%(committerdate:iso-strict) %(refname)',
    'refs/remotes'
  ]

  const data = await cmd(app, cwd, command, args)
  const lines = data
    .split('\n')
    .filter(line => !!line.trim() && line.indexOf('refs/remotes/origin/HEAD') === -1)

  return lines.map(line => {
    const split = line.split(' ')
    const age = new Date(split[0])
    const ref = split[1].replace('refs/remotes/origin/', '')
    return { age, ref }
  })
}
