import pack from '../git/pack'
import appPath from '../git/path'
import { join } from 'path'
import { readFile } from 'fs'
import { parseTaskFile, Task } from '../tasks'

export async function checkout(app: Concierge.Application, sha: string) {
  /**
   * TODO
   * - Switch over to shallow clones (clone with --depth 1)
   * - Concierge maintains a long-lived repository folder for tracking remotes
   * - Hosts will always clone: git clone -b [SHA] --single-branch --depth 1 [repo] [temp-location]
   */

  // TODO: This should use a specific host
  const stream = await pack(app, sha)

  const task = await getTaskFile(app)
  return { task, stream }
}

function getTaskFile(app: Concierge.Application) {
  const path = appPath(app)

  return new Promise<Task | null>(resolve => {
    readFile(join(path, 'concierge.yml'), (err, data) => {
      if (err) {
        return resolve(null)
      }

      const task = parseTaskFile(data.toString())
      resolve(task)
    })
  })
}
