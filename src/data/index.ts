import db from './connection'

export const hosts = () => db('Hosts')
export const applications = () => db('Applications')
export const configurations = () => db('Configurations')
export const heartbeats = () => db('Heartbeats')

export default db