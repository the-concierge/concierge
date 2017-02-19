import { RequestHandler } from 'express'
import getContainers from '../../hosts/getContainers'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id || null
  const containers = await getContainers(id)
  res.json(containers)

}
export default handler