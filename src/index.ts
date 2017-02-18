
import * as log from './logger'

// Make logger available globally
global['log'] = log

import * as fs from 'fs'
import * as path from 'path'
import initDatabase from './data/init'
import startProxying from './proxy'
import startWeb from './api/web/start'
import { start as startSockets } from './api/events/server'
import updateContainerPorts from './api/hosts/updatePorts'
import watchContainers from './api/events/containers'
import watchHosts from './api/events/hosts'
import loadWebRoutes from './api/web/loader'
import { initialise as listenToDockerHosts } from './api/info'
import { initialise as initConfig } from './api/configurations/get'

async function start() {
  // Create the database if it doesn't exist
  const isDbCreated = await initDatabase()
  if (isDbCreated) {
    log.info('Created new database')
  }

  // Create the folder where the LetsEncrypt certificates will be held
  const certPath = path.resolve(__dirname, '../certificates')
  try {
    fs.readdirSync(certPath)
  } catch (ex) {
    fs.mkdirSync(certPath)
    log.info('Created certificates folder')
  }

  // Fetch the configuration from the database and cache it
  await initConfig()

  // Start the web server
  await startWeb()

  // Start the web socket listener
  await startSockets()

  // Listen for Performance (memory and CPU) and Docker events on all Containers
  await watchContainers()

  // Listen for Docker events on all Hosts
  await watchHosts()

  // Create the route handlers
  await loadWebRoutes()

  // Create the proxy server that forwards requests from [subdomain].[proxy] to the container
  await startProxying()

  // Get the all Container's exposed port number and store it in the database
  await updateContainerPorts()
  log.info('Successfully updated all container ports')

  // Monitor the status of all Hosts
  await listenToDockerHosts()
}

start()
