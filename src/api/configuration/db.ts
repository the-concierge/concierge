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

  const keys = Object.keys(config) as Array<keyof Concierge.Configuration>

  const badKeys: string[] = []
  for (const key of keys) {
    const validator = validate[key]
    if (!validator) {
      continue
    }

    if (!validator(config[key])) {
      badKeys.push(key)
    }
  }

  if (badKeys.length > 0) {
    const message = badKeys.join(', ')
    throw new Error(`Invalid configuration, keys have invalid values: ${message}`)
  }

  await db
    .configurations()
    .update({ config: next })
    .where('id', 1)

  return next
}

const validate: { [key in keyof Concierge.Configuration]?: (value: any) => boolean } = {
  debug: val => typeof val === 'number',
  gitPollingIntervalSecs: val => typeof val === 'number' && val > 0,
  statsBinSize: val => typeof val === 'number' && val > 0,
  maxConcurrentBuilds: val => typeof val === 'number' && val > 0,
  statsRetentionDays: val => typeof val === 'number' && val > 0
}
