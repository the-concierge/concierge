import { RequestHandler } from 'express'
import * as get from '../../containers/get'
import getVolume from '../../containers/getVolume'

const handler: RequestHandler = async (req, res) => {
  const container = await get.one(req.params.id)
  const filename = `${container.subdomain}_${container.applicationName}_${container.variant}.tar`
  const volume = await getVolume(container)
  res
    .contentType('application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.setHeader('Content-Description', 'File Transfer')
  res.send(volume)
}

export default handler