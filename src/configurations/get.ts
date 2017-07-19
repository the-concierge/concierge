import db from '../data/connection'
import Config = Concierge.Configuration

/**
 * Ideally, it'd be nice to depcrate the Configuration cache
 * It cannot be deprecated as some other functions that perform transaction require the Configuration
 * and the `get` function below performs the database call
 *
 * Lesson learned: Return a QueryBuilder<T> object from all DB APIs where T is the type of the object expected from the database
 * Only the top-most modules should execute queries. E.g. route handlers
 */
let configCache: Config = null
export default () => configCache

export async function initialise() {
  configCache = await get()
  return true
}

export async function get(): Promise<Concierge.Configuration> {
  const config: Concierge.Configuration = await db('Configurations')
    .select()
    .first()

  return config
}

export const setCache = (config: Config) => {
  configCache = config as any
}