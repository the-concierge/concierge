import { RequestHandler } from 'express'
import createContainer from '../../containers/create'

const handler: RequestHandler = async (req, res) => {
  const newContainer = await createContainer(req.body, null)
  res.json(newContainer)
}

export default handler