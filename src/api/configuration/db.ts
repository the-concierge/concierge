import * as db from '../../data'

export async function get() {
  const config = await db.configurations()
    .select()
    .first() as Concierge.Configuration
  return config
}

export async function update(config: Partial<Concierge.Configuration>) {
  const result = await db.configurations()
    .update(config)

  cache = { ...cache, ...config }
  return result
}

export let cache: Concierge.Configuration | undefined

get().then(cfg => cache = cfg)