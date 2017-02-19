import { RequestHandler } from 'express'
import saveAll from '../../concierges/saveAll'

const handler: RequestHandler = async (req, res) => {
  try {
    await saveAll(req.body)
    res
      .status(200)
      .json({})
  } catch (ex) {
    res
      .status(500)
      .json(ex)
  }
}

export default handler