import db from './connection'

export const HOSTS = 'Hosts'
export const APPLICATIONS = 'Applications'
export const CONFIGURATIONS = 'Configurations'
export const HEARTBEATS = 'Heartbeats'
export const CONCIERGES = 'Concierges'
export const CREDENTIALS = 'Credentials'
export const APPLICATION_REMOTES = 'ApplicationRemotes'

export const hosts = () => db(HOSTS)
export const applications = () => db(APPLICATIONS)
export const configurations = () => db(CONFIGURATIONS)
export const heartbeats = () => db(HEARTBEATS)
export const concierges = () => db(CONCIERGES)
export const credentials = () => db(CREDENTIALS)
export const applicationRemotes = () => db(APPLICATION_REMOTES)

export { db }

export default db
