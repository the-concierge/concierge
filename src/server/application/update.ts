import { RequestHandler } from 'express'
import saveAll from '../../applications/saveAll'

const handler: RequestHandler = async (req, res) => {
  try {
    await saveAll(req.body)
    res
      .status(200)
      .send()
  } catch (ex) {
    res
      .status(500)
      .send(ex)
  }
}

export default handler