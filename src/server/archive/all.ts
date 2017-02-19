import { RequestHandler } from 'express'
import get from '../../archive/get'

const handler: RequestHandler = async (req, res) => {
  const archives = await get()
  res.json(archives)
}

export default handler