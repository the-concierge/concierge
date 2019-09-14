import { RequestHandler } from 'express'
import * as get from './db'

export const one: RequestHandler = async (req, res) => {
  const application = await get.one(Number(req.params.id))
  if (!application) {
    return res.status(404).json({ message: 'Not found' })
  }

  return res.json(application)
}

export const all: RequestHandler = async (_, res) => {
  const applications = await get.all()
  res.json(applications)
}
