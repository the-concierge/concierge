
import db from './connection'

/**
 * Create the database schema
 */
export default async function create() {
  const funcs = [
    configurationTable,
    applicationTable,
    hostTable,
    instanceTable,
    conciergeTable,
    heartbeatTable
  ]

  for (const func of funcs) {
    const query = func()
    await query
  }
  return true
}

function configurationTable() {
  return db.schema.createTable('Configurations', tbl => {
    tbl.integer('conciergePort').defaultTo(3141)
    tbl.text('proxyHostname').defaultTo('localhost')
    tbl.text('proxyIp').defaultTo('0.0.0.0')
    tbl.integer('httpPort').defaultTo(5926)
    tbl.integer('debug').defaultTo(1)
    tbl.integer('heartbeatFrequency').defaultTo(60000)
    tbl.integer('heartbeatBinSize').defaultTo(1440)
    tbl.text('dockerRegistry').defaultTo('http://0.0.0.0:5000')
  })
}

function instanceTable() {
  return db.schema.createTable('Instances', tbl => {
    tbl.bigIncrements('id').primary()
    tbl.integer('hostId')
    tbl.text('containerId')
  })
}

function applicationTable() {
  return db.schema.createTable('Applications', tbl => {
    tbl.increments('id').primary()
    tbl.text('name').unique()
    tbl.text('repository').notNullable()
    tbl.text('key').defaultTo('')
  })
}

function hostTable() {
  return db.schema.createTable('Hosts', tbl => {
    tbl.increments('id').primary()
    tbl.text('hostname').unique()
    tbl.integer('capacity').defaultTo(5)
    tbl.integer('dockerPort').defaultTo(2375)
    tbl.text('sshUsername').notNullable()
    tbl.integer('sshPort').defaultTo(22)
    tbl.text('privateKey').defaultTo('********')
  })
}

function conciergeTable() {
  return db.schema.createTable('Concierges', tbl => {
    tbl.increments('id').primary()
    tbl.text('label').unique().notNullable()
    tbl.text('hostname').notNullable()
    tbl.integer('port').defaultTo(3141)
  })
}

function heartbeatTable() {
  return db.schema.createTable('Heartbeats', tbl => {
    tbl.integer('hostId').notNullable()
    tbl.integer('containerId').notNullable()
    tbl.text('cpu').notNullable()
    tbl.text('memory').notNullable()
    tbl.integer('responseTime').notNullable()
    tbl.increments('timestamp').notNullable()
  })
}