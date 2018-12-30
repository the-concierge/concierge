import cmd from './cmd'
import appPath from './path'
import { Branch } from '../applications/types'

export default async function getRemoteTags(
  application: Schema.Application,
  branchesOnly: boolean = false
) {
  const workDir = appPath(application)
  const args = branchesOnly ? `--heads` : `--tags --heads`
  const command = `git ls-remote ${args}`
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
      const age = getAge(ref)
      return { type, ref, sha, age } as Branch & { type: typeof type }
    })
    .filter(ref => !!ref.ref && !!ref.age)
    .filter(ref => !ref.ref.endsWith('^{}'))

  return tags
}

async function getRemoteAges(app: Schema.Application) {
  const cwd = appPath(app)

  // We need to update our local version of remotes before using the for-each-ref command
  await cmd(app, cwd, `git remote update origin --prune`)

  const command = `git`
  const args = [
    'for-each-ref',
    '--sort=-committerdate',
    '--format={"age":"%(committerdate:iso)", "ref":"%(refname)", "author":"%(authorname)" }',
    'refs/remotes'
  ]

  const data = await cmd(app, cwd, command, args)

  type Ref = { age: string; ref: string; author: string }
  const refs = data
    .split('\n')
    .filter(line => !!line.trim() && line.indexOf('refs/remotes/origin/HEAD') === -1)
    .map(line => JSON.parse(line) as Ref)
    .map(ref => ({
      ...ref,
      age: new Date(ref.age),
      ref: ref.ref.replace('refs/remotes/origin/', '')
    }))

  return refs
}

// git for-each-ref --sort=-committerdate --format="\"{\\\"date\\\":\\\"%(committerdate:iso)\\\", \\\"ref\\\":\\\"%(refname)\\\", \\\"author\\\":\\\"%(authorname)\\\" }\"" refs/remotes
// git for-each-ref --sort=-committerdate --format="%(committerdate:iso) %refname %authorname" refs\remotes
