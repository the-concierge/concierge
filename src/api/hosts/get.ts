import { RequestHandler } from 'express'
import * as get from './db'

export const getOne: RequestHandler = async (req, res) => {
  const id = req.params.id
  const host = await get.getOne(id)
  host.privateKey = '********'
  res.json(host)
}

export const getAll: RequestHandler = async (req, res) => {
  const hosts = await get.getAll()
  hosts.forEach(host => host.privateKey = '********')
  res.json(hosts)
}