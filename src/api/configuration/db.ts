import * as db from '../../data'
import * as os from 'os'

const defaultConfig: Concierge.Configuration = {
  name: os.hostname() || 'development',
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
    .update('config', JSON.stringify(next))
    .where('id', 1)

  return next
}

const validate: { [key in keyof Concierge.Configuration]?: (value: any) => boolean } = {
  debug: val => isNum(val),
  gitPollingIntervalSecs: val => isNum(val, 0),
  statsBinSize: val => isNum(val, 0),
  maxConcurrentBuilds: val => isNum(val, 0),
  statsRetentionDays: val => isNum(val, 0)
}

function isNum(value: any, greaterThan?: number): value is number {
  const num = Number(value)
  if (isNaN(num)) {
    return false
  }

  return greaterThan === undefined ? true : num > greaterThan
}
