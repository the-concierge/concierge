import './logger'
import migrateDatabase from './data/migrate'
import startServer from './server'
import watchHosts from './api/stats/hosts'
import watchContainers from './api/stats/containers'
import watchRemotes from './api/applications/monitor'
import { initialise as initConfig } from './configurations/get'

async function start() {
  // Migrate the database
  await migrateDatabase()

  // Fetch the configuration from the database and cache it
  await initConfig()

  // Start the web server
  await startServer()

  // Listen for Performance (memory and CPU) and Docker events on all Containers
  await watchContainers()
  setInterval(() => watchContainers(), 5000)

  // Listen for Docker events on all Hosts
  await watchHosts()
  setInterval(() => watchHosts(), 5000)

  // Monitor application remotes and automatically build
  await watchRemotes()
}

start()

process.on('unhandledRejection', (err: any) => {
  log.error(err.message || err)

  if (err.stack) {
    log.error(err.stack)
  }
})
