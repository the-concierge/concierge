import * as db from './db'
import { RequestHandler } from 'express'
import { queue } from './monitor/queue'

type Body = {
  ref: string
  tag: string
  type: string
  sha: string
}

const handler: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  const { tag, sha, ref } = req.query as Body
  const app = await db.one(id)

  if (!app) {
    res.status(400).json({ message: `Application '${id}' does not exist` })
    return
  }

  try {
    /**
     * This will fail if:
     * - This is no available host
     * - It fails to pack the repo tar ball due to a deployment of that image already taking place
     *
     * It will not await the entire build
     */
    queue.add(app, {
      age: new Date(),
      ref,
      sha,
      seen: new Date()
    })

    res.json({ message: `Added image '${tag}' to build queue` })
  } catch (ex) {
    log.error(ex.message || ex)
    if (ex.stack) {
      log.debug(ex.stack)
    }

    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
