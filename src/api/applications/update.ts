import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const { repository, name, username, key, label, dockerfile, credentialsId, autoBuild } = req.body

  const id = req.params.id
  const body = {
    repository,
    name,
    username,
    key,
    label,
    dockerfile,
    credentialsId: Number(credentialsId),
    autoBuild: !!autoBuild
  }

  if (credentialsId > 0) {
    body.username = ''
    body.key = ''
  }

  try {
    await db
      .applications()
      .update(body)
      .where('id', id)
    res.json({ id, ...body })
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
