import * as Knex from 'knex'
import { CONFIGURATIONS } from '../'

export async function up(db: Knex) {
  await db.schema.table(CONFIGURATIONS, tbl => {
    tbl.dropColumn('httpPort')
    tbl.dropColumn('proxyIp')
  })
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}
