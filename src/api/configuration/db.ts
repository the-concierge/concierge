import * as db from '../../data'

export function getQuery() {
  return db
    .configurations()
    .select()
    .first()
}

export async function get() {
  const result: Schema.Configuration = await db
    .configurations()
    .select()
    .where('id', 1)
    .first()

  const config: Concierge.Configuration = JSON.parse(result.config)
  return config
}

export async function update(config: Partial<Concierge.Configuration>) {
  const original = await get()
  const next: Concierge.Configuration = {
    ...original,
    ...config,
    conciergePort: original.conciergePort
  }
  const result = await db
    .configurations()
    .update({ config: next })
    .where('id', 1)
  return result
}
