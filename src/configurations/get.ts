import db from '../data/connection'
import Config = Concierge.Configuration
import { port } from './port'

/**
 * Ideally, it'd be nice to depcrate the Configuration cache
 * It cannot be deprecated as some other functions that perform transaction require the Configuration
 * and the `get` function below performs the database call
 *
 * Lesson learned: Return a QueryBuilder<T> object from all DB APIs where T is the type of the object expected from the database
 * Only the top-most modules should execute queries. E.g. route handlers
 */
let configCache: Config | null = null
export default async function getCache() {
  if (!configCache) {
    await initialise()
  }

  return configCache as Config
}

export async function initialise() {
  configCache = await get()
  return true
}

export async function get(): Promise<Concierge.Configuration> {
  const config: Concierge.Configuration = await db('Configurations')
    .select()
    .first()

  config.conciergePort = port
  return config
}

export const setCache = (config: Partial<Config>) => {
  config.conciergePort = port
  configCache = { ...configCache, ...(config as any) }
}
