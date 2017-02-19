import getVolume from '../../archive/getVolume'
import { RequestHandler } from 'express'

const handler: RequestHandler = async (req, res) => {
  const filename = req.params.volume
  const volume = await getVolume(filename)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.setHeader('Content-Description', 'File Transfer')
  res.write(volume)
}

export default handler