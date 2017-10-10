import * as knex from 'knex'
import * as path from 'path'

const dbLocation =
  process.env.CONCIERGE_DB_PATH || path.resolve(__dirname, '..', '..', 'db', 'concierge.db')

const connection = knex({
  client: 'sqlite3',
  connection: {
    filename: dbLocation
  },
  useNullAsDefault: true
} as any)

function getTransaction(): Promise<knex.Transaction> {
  const promise = new Promise<knex.Transaction>(resolve => {
    connection.transaction(trx => resolve(trx))
  })
  return promise
}

;(connection as any)['getTransaction'] = getTransaction

export default connection as knex & { getTransaction: typeof getTransaction }
