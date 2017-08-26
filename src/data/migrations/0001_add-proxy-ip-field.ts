import * as Knex from 'knex'
import { HOSTS } from '../'

export async function up(db: Knex) {
  await db.schema.table(HOSTS, tbl => {
    tbl.text('proxyIp').defaultTo('')
  })
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}
