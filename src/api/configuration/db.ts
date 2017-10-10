import * as db from '../../data'
import getCache, * as cache from '../../configurations/get'

export async function get() {
  const config = (await db
    .configurations()
    .select()
    .first()) as Concierge.Configuration
  return config
}

export async function update(config: Partial<Concierge.Configuration>) {
  delete config.conciergePort
  const result = await db.configurations().update(config)

  cache.setCache(config)
  return result
}

export async function getConfig() {
  return getCache()
}
