
import * as log from './logger'

// Make logger available globally
global['log'] = log

import migrateDatabase from './data/migrate'
import startServer from './server'
import watchHosts from './api/stats/hosts'
import watchContainers from './api/stats/containers'
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

  // Create the proxy server that forwards requests from [subdomain].[proxy] to the container
  // await startProxying()

  // Get the all Container's exposed port number and store it in the database
  // await updateContainerPorts()
}

start()

process.on('unhandledRejection', err => {
  log.error(err.message || err)

  if (err.stack) {
    log.error(err.stack)
  }
})
