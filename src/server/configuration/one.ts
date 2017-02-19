import { RequestHandler } from 'express'
import { get } from '../../configurations/get'

const handler: RequestHandler = async (req, res) => {
  const config = await get()
  res.json(config)
}

export default handler