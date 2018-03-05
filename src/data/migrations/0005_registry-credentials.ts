import * as Knex from 'knex'
import { CONFIGURATIONS } from '../'

export async function up(db: Knex) {
  await db.schema.table(CONFIGURATIONS, tbl => {
    tbl
      .integer('registryCredentials')
      .references(`${CONFIGURATIONS}.id`)
      .nullable()
  })
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}
