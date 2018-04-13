import pack from '../git/pack'
import appPath from '../git/path'
import { join, extname } from 'path'
import { readFile } from 'fs'
import { parseTaskFile, Task } from '../tasks'
import Application = Concierge.Application

type Checkout = { task: Task | null; stream: NodeJS.ReadableStream }

export async function checkout(app: Application, sha: string, attempt = 1): Promise<Checkout> {
  /**
   * TODO
   * - Switch over to shallow clones (clone with --depth 1)
   * - Concierge maintains a long-lived repository folder for tracking remotes
   * - Hosts will always clone: git clone -b [SHA] --single-branch --depth 1 [repo] [temp-location]
   */

  // TODO: This should use a specific host

  try {
    const stream = await pack(app, sha)

    const task = await getTaskFile(app)
    return { task, stream }
  } catch (ex) {
    if (attempt === 5) {
      throw ex
    }

    if (ex.code !== 'E_REPOBUSY') {
      throw ex
    }

    // We'll try every 250ms up to a maximum of 5 tries
    return new Promise<Checkout>(resolve => {
      setTimeout(() => {
        resolve(checkout(app, sha, ++attempt))
      }, 250)
    })
  }
}

async function getTaskFile(app: Concierge.Application) {
  const base = appPath(app)
  const files = ['concierge.yml', 'concierge.yaml', 'concierge.json']

  for (const file of files) {
    const content = await readFileAsync(join(base, file))
    if (!content) {
      continue
    }

    const task = parseTaskFile(content, extname(file))
    if (task) {
      return task
    }
  }

  return null
}

function readFileAsync(file: string) {
  return new Promise<string | null>(resolve => {
    readFile(file, (err, data) => {
      if (err) {
        return resolve(null)
      }

      resolve(data.toString())
    })
  })
}
