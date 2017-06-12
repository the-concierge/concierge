import db from './connection'

export function getHosts() {
  return db('Hosts')
}

export default db