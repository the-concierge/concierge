import { RequestHandler } from 'express'
import * as get from './get-images'

export const all: RequestHandler = async (req, res) => {
  const images = await get.getAll()
  res.json(images)
}

export const one: RequestHandler = async (req, res) => {
  const id = req.params.id
  const images = await get.getOne(id)
  return res.json(images)
}
