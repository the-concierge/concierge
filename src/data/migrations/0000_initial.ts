import * as os from 'os'
import * as Knex from 'knex'
import * as tables from '../'

export async function up(db: Knex) {
  const configurationExists = await db.schema.hasTable(tables.CONFIGURATIONS)
  if (!configurationExists) {
    await db.schema.createTable(tables.CONFIGURATIONS, tbl => {
      tbl.text('name')
      tbl.integer('conciergePort').defaultTo(3141)
      tbl.text('proxyHostname').defaultTo('localhost')
      tbl.text('proxyIp').defaultTo('0.0.0.0')
      tbl.integer('httpPort').defaultTo(5926)
      tbl.integer('debug').defaultTo(1)
      tbl.integer('statsBinSize').defaultTo(60) // Default to 1 minute per bin
      tbl.integer('statsRetentionDays').defaultTo(1) // Truncate stats older than 1 day by default
      tbl.text('dockerRegistry').defaultTo('0.0.0.0:5000')
    })

    const defaultName = os.hostname() || 'development'
    await db('Configurations')
      .insert({ name: defaultName })

    log.info(`Concierge renamed to: ${defaultName}`)
  }

  const applicationsExists = await db.schema.hasTable(tables.APPLICATIONS)
  if (!applicationsExists) {
    await db.schema.createTable(tables.APPLICATIONS, tbl => {
      tbl.increments('id').primary()
      tbl.text('name').unique()
      tbl.text('repository').notNullable()
      tbl.text('username').defaultTo('')
      tbl.text('key').defaultTo('')
      tbl.text('dockerfile').defaultTo('')
      tbl.text('label').defaultTo('')
    })
  }

  const hostsExists = await db.schema.hasTable(tables.HOSTS)
  if (!hostsExists) {
    await db.schema.createTable(tables.HOSTS, tbl => {
      tbl.increments('id').primary()
      tbl.text('hostname').unique()
      tbl.text('vanityHostname').defaultTo('')
      tbl.integer('capacity').defaultTo(5)
      tbl.integer('dockerPort').defaultTo(2375)
      tbl.text('sshUsername').notNullable()
      tbl.integer('sshPort').defaultTo(22)
      tbl.text('privateKey').defaultTo('********')
    })
  }

  const conciergesExists = await db.schema.hasTable(tables.CONCIERGES)
  if (!conciergesExists) {
    await db.schema.createTable(tables.CONCIERGES, tbl => {
      tbl.increments('id').primary()
      tbl.text('label').unique().notNullable()
      tbl.text('hostname').notNullable()
      tbl.integer('port').defaultTo(3141)
    })
  }

  const heartbeatsExists = await db.schema.hasTable(tables.HEARTBEATS)
  if (!heartbeatsExists) {
    await db.schema.createTable(tables.HEARTBEATS, tbl => {
      tbl.integer('hostId').notNullable()
      tbl.integer('containerId').notNullable()
      tbl.text('cpu').notNullable()
      tbl.text('memory').notNullable()
      tbl.integer('timestamp').notNullable()
    })
  }
}

export async function down(_: Knex) {
  throw new Error('Down migrations not supported')
}