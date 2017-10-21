import * as Knex from 'knex'
import { APPLICATION_REMOTES, APPLICATIONS } from '../'

export async function up(db: Knex) {
  await db.schema.createTable(APPLICATION_REMOTES, tbl => {
    tbl.increments('id').primary()
    tbl.text('applicationId').notNullable()
    tbl.text('remote').notNullable()
    tbl.text('sha ').notNullable()
    tbl.integer('state').notNullable()
    tbl.text('imageId').nullable()
    tbl.dateTime('seen').nullable()
    tbl.dateTime('age').nullable()
  })

  await db.schema.table(APPLICATIONS, tbl => {
    tbl.boolean('autoBuild').nullable()
  })
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}
