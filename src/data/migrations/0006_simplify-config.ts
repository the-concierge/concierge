import * as knex from 'knex'
import { CONFIGURATIONS } from '..'

export async function up(db: knex) {
  const config: any = await db(CONFIGURATIONS)
    .select()
    .first()

  await db.schema.dropTableIfExists(CONFIGURATIONS)
  await db.schema.createTable(CONFIGURATIONS, tbl => {
    tbl.increments('id')
    tbl.text('config')
  })

  await db(CONFIGURATIONS).insert({ config: JSON.stringify(config) })
}

export function down(_: knex) {
  throw new Error('Down migration not supported')
}
