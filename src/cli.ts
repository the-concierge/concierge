#!/usr/bin/env node
import * as minimist from 'minimist'

const args = minimist(process.argv.slice(1))

const port = Number(args.port)
if (!isNaN(port)) {
  process.env.CONCIERGE_PORT = port
}

const dbPath = args.path || args.db
if (dbPath) {
  process.env.CONCIERGE_DB_PATH = dbPath
}

require('./index')