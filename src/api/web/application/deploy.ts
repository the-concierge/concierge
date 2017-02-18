import deploy from '../../variants/deploy'
import * as getApplications from '../../applications/get'

import { RequestHandler } from 'express'
const handler: RequestHandler = async (request, res) => {
  const id = request.params.id
  const tag = request.params.tag
  const app = await getApplications.one(id)

  try {
    const results = await deploy(app, tag)
    res.json(results)
  } catch (ex) {
    res
      .status(500)
      .json({ err: ex })
  }
}

export default handler