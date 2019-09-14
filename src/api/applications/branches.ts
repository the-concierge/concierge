import { RequestHandler } from 'express'
import { State } from './types'
import * as get from './db'

const handler: RequestHandler = async (req, res) => {
  const appId = Number(req.params.id)
  const activeOnly = req.query.hasOwnProperty('active')

  if (!appId) {
    const remotes = await get.getAllRemotes()
    return res.json(getActiveBranches(remotes, activeOnly))
  }

  const remotes = await get.getRemotes(appId)
  return res.json(getActiveBranches(remotes, activeOnly))
}

export default handler

function getActiveBranches(remotes: Schema.ApplicationRemote[], filter: boolean) {
  if (!filter) {
    return remotes
  }

  const thresholdDate = new Date()

  // TODO: Replace threshold with values from application configuration
  thresholdDate.setDate(thresholdDate.getDate() - 7)
  const threshold = thresholdDate.valueOf()

  return remotes.filter(remote => {
    if (remote.state === State.Inactive) {
      return false
    }

    if (!remote.age) {
      return false
    }

    const date = new Date(remote.age).valueOf()
    return date > threshold
  })
}
