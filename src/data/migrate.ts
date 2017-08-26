import store from './'
import * as path from 'path'
import * as Knex from 'knex'

export default async function migrate(config: { knex?: Knex } = {}) {
  const db = config.knex || store
  const directory = path.resolve(__dirname, 'migrations')

  const startMigration = await db.migrate.currentVersion()
  log.info(`Current migration: ${startMigration}`)

  await db.migrate.latest({ directory })

  const endMigration = await db.migrate.currentVersion()
  log.info(`Migrated to: ${endMigration}`)
}