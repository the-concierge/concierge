import * as db from '../../data'

const defaultConfig: Concierge.Configuration = {
  name: '',
  conciergePort: 3141,
  debug: 0,
  dockerRegistry: undefined,
  proxyHostname: undefined,
  registryCredentials: undefined,
  statsBinSize: 60,
  statsRetentionDays: 3,
  maxConcurrentBuilds: 2,
  gitPollingIntervalSecs: 5
}

export async function getConfig() {
  const result: Schema.Configuration = await db
    .configurations()
    .select()
    .where('id', 1)
    .first()

  const config: Concierge.Configuration = JSON.parse(result.config)

  return {
    ...defaultConfig,
    ...config
  }
}

export async function setConfig(config: Partial<Concierge.Configuration>) {
  const original = await getConfig()
  const next: Concierge.Configuration = {
    ...defaultConfig,
    ...original,
    ...config,
    conciergePort: original.conciergePort
  }

  await db
    .configurations()
    .update({ config: next })
    .where('id', 1)

  return next
}
