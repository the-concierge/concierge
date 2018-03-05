import { RequestHandler } from 'express'
import * as db from '../../data'

const handler: RequestHandler = async (req, res) => {
  const id = req.params.id

  try {
    await db
      .credentials()
      .delete()
      .where('id', id)

    res.json({ id, message: 'Successfully removed credentials' })
  } catch (ex) {
    res.status(500).json({ message: ex.message || ex })
  }
}

export default handler
