import * as Knex from 'knex'
import { CREDENTIALS, APPLICATIONS } from '../'

export async function up(db: Knex) {
  await db.schema.createTable(CREDENTIALS, tbl => {
    tbl.increments('id').primary()
    tbl
      .text('name')
      .notNullable()
      .unique()
    tbl.text('username').notNullable()
    tbl.text('key').notNullable()
  })

  await db.schema.table(APPLICATIONS, tbl => {
    tbl
      .integer('credentialsId')
      .nullable()
      .references(`${CREDENTIALS}.id`)
  })
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}
