
import * as log from './logger'

// Make logger available globally
global['log'] = log

import * as fs from 'fs'
import * as path from 'path'
import initDatabase from './data/init'
import startProxying from './proxy'
import startServer from './server'
import updateContainerPorts from './hosts/updatePorts'
import watchHosts from './api/stats/hosts'
import watchContainers from './api/stats/containers'
import { initialise as listenToDockerHosts } from './info'
import { initialise as initConfig } from './configurations/get'

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
  await startServer()

  // Listen for Performance (memory and CPU) and Docker events on all Containers
  await watchContainers()

  // Listen for Docker events on all Hosts
  await watchHosts()

  // Create the proxy server that forwards requests from [subdomain].[proxy] to the container
  await startProxying()

  // Get the all Container's exposed port number and store it in the database
  await updateContainerPorts()

  // Monitor the status of all Hosts
  await listenToDockerHosts()
}

start()
