#!/usr/bin/env node
import * as minimist from 'minimist'
import * as log from './logger'
import * as path from 'path'
import chalk = require('chalk')

const script = path.resolve(__dirname, 'index.js')
const pm2 = require('pm2')

const args = minimist(process.argv.slice(1))
const name = 'the-concierge'
const commands = ['start', 'stop', 'restart', 'status']

// Default to the 'start' script if no argument is provided
const state = (args._[1] || 'start').toLowerCase()
const port = Number(args.port)
const dbPath = args.path || args.db

if (!isNaN(port)) {
  process.env.CONCIERGE_PORT = port
}

if (dbPath) {
  process.env.CONCIERGE_DB_PATH = dbPath
}

if (!commands.some(cmd => cmd === state)) {
  log.error(
    `Unknown command '${state}'
Allowed commands: ${commands.join(', ')}`
  )
  process.exit(1)
}

pm2.connect((err: any) => {
  if (err) {
    log.error(`Failed to connect to PM2: ${err.message || err}`)
    process.exit(2)
  }

  const errCallback = function(err: any, result?: any) {
    pm2.disconnect()
    if (err) {
      log.error(`Failed to ${state} Concierge: ${err.message || err}`)
      process.exit(1)
    }

    if (state === 'status') {
      const status = result[0]
      if (!status) {
        return log.error(`Unable to determine status: Try running "the-concierge start"`)
      }

      const online = status.pm2_env.status === 'online'
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.cyan.bold('Concierge')}:
${chalk.cyan.bold('      PID')}: ${status.pid}
${chalk.cyan.bold('   Status')}: ${(online ? chalk.green : chalk.red).bold(status.pm2_env.status)}
${chalk.cyan.bold('   Memory')}: ${Math.round(status.monit.memory / 1024 / 1024)}MB
${chalk.cyan.bold(' Restarts')}: ${status.pm2_env.restart_time}`
      )
      return
    }

    log.info(`Successfully executed '${state}'`)
  }

  switch (state) {
    case 'start':
      pm2.start({ name, script, instances: 1, exec_mode: 'fork' }, errCallback)
      break
    case 'stop':
      pm2.stop(name, errCallback)
      break
    case 'status':
      pm2.describe(name, errCallback)
      break
    case 'restart':
      pm2.restart(name, errCallback)
      break
  }
})
