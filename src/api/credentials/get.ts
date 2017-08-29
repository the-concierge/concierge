import { RequestHandler } from 'express'
import * as get from './db'

export const one: RequestHandler = async (req, res) => {
  const creds = await get.one(req.params.id)
  creds.key = ''
  res.json(creds)
}

export const all: RequestHandler = async (req, res) => {
  const creds = await get.all()

  for (const cred of creds) {
    cred.key = ''
  }

  res.json(creds)
}