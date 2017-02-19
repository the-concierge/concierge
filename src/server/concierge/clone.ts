import { RequestHandler } from 'express'
import cloneContainer from '../../concierges/clone'

const handler: RequestHandler = async (req, res) => {
  try {
    const result = await cloneContainer(req.body)
    res.json(result)
  } catch (ex) {
    res
      .status(500)
      .json(ex)
  }
}

export default handler