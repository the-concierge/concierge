import * as db from '../../data'

export function getQuery() {
  return db
    .configurations()
    .select()
    .first()
}

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
  return result
}
