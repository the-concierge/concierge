import { RequestHandler } from 'express'
import * as getHosts from '../../hosts/get'

const handler: RequestHandler = async (req, res) => {
  const hosts = await getHosts.all()
  hosts.forEach(host => host.privateKey = '********')
  res.json(hosts)
}
export default handler