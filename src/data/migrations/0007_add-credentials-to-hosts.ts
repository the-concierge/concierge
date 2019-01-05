import * as knex from 'knex'
import { CREDENTIALS, HOSTS } from '..'

export async function up(db: knex) {
  await db.schema.table(HOSTS, tbl => {
    tbl.dropColumns('sshUsername', 'privateKey')
    tbl
      .integer('credentialsId')
      .nullable()
      .references(`${CREDENTIALS}.id`)
  })
}

export async function down(_: knex) {
  throw new Error('Down migrations not supported')
}
