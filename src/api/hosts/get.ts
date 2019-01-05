import { RequestHandler } from 'express'
import * as get from './db'

export const getOne: RequestHandler = async (req, res) => {
  const id = req.params.id
  const host = await get.getOne(id)
  res.json(host)
}

export const getAll: RequestHandler = async (_, res) => {
  const hosts = await get.getAll()
  res.json(hosts)
}
