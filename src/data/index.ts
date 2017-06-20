import db from './connection'

export const hosts = () => db('Hosts')
export const applications = () => db('Applications')

export default db