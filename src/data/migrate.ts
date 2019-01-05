import store from './'
import * as path from 'path'
import * as Knex from 'knex'
import * as host from '../api/hosts/db'

export default async function migrate(config: { knex?: Knex } = {}) {
  const db = config.knex || store
  const directory = path.resolve(__dirname, 'migrations')

  const startMigration = await db.migrate.currentVersion()
  log.info(`Current migration: ${startMigration}`)

  await db.migrate.latest({ directory })

  const endMigration = await db.migrate.currentVersion()
  log.info(`Migrated to: ${endMigration}`)
  await createDefaultHost()
}

async function createDefaultHost() {
  const isCliInit = process.argv.some(arg => arg === '-i' || arg === '--init')
  if (!isCliInit) {
    return
  }

  const hosts = await host.getAll()
  if (hosts.length) {
    return
  }

  await host.create({
    hostname: '',
    vanityHostname: 'localhost',
    proxyIp: '',
    sshPort: 22,
    dockerPort: 2375,
    capacity: 5,
    credentialsId: null
  })

  log.info('Created default host')
}
