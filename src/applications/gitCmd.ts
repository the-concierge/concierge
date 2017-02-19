import * as childProcess from 'child_process'
import { writeFile, chmod, unlink } from 'fs'

/**
 * Execute abritrary Git commands in an Application's git repository
 */
export default async function gitCommand(application: Concierge.Application, workingDirectory: string, command: string) {
  log.debug(`Cloning ${application.name}`)
  const isPrivate = !!application.gitPrivateToken

  // If the repository is not private, we do not need to use a SSH private key
  if (!isPrivate) {
    const promise = new Promise<boolean>((resolve, reject) => {
      const proc = childProcess.exec(command,
        { cwd: workingDirectory },
        (error, stdout, stderr) => {
          if (error) {
            log.error(stderr)
            return reject(stderr)
          }
          resolve(true)
        }
      )
      proc.on('message', msg => log.debug(`[GIT:${application.name}] ${msg}`))
    })
    const result = await (promise)
    return result
  }
  // A script needs to be created and passed to the Git command with instructions on how to consume SSH
  // This is a necessary evil for passing a SSH private key programmatically
  const filenames = await (createFiles(application.gitPrivateKey))
  const GIT_SSH = filenames.script
  try {
    await (spawnAsync(command, { detached: true, cwd: workingDirectory, env: { GIT_SSH } }))
    await (teardown(filenames))
    return true
  } catch (ex) {
    await (teardown(filenames))
    throw ex
  }

}

async function createFiles(privateKey: string) {
  // We need to create a file that is guaranteed not to clash with any existing files
  const suffix = randomWord(20)
  const scriptFilename = `/tmp/${suffix}_wrapper.sh`
  const keyFilename = `/tmp/${suffix}_key.key`
  const script = `#!/bin/sh\nexec ssh -i ${keyFilename} -o StrictHostKeyChecking=no "$@"`
  const filenames = { script: scriptFilename, key: keyFilename }

  // Create the script and key file
  await writeFileAsync(scriptFilename, script)
  await writeFileAsync(keyFilename, privateKey)

  // Set the correct permissions (script is executable, keyfile is write/read only by owner)
  await chmodAsync(scriptFilename, '0755' as any)
  await chmodAsync(keyFilename, '0600' as any)
  log.debug('Set permissions')
  return filenames
};

async function teardown(filenames: { key: string, script: string }) {
  await unlinkAsync(filenames.key)
  await unlinkAsync(filenames.script)
  return true
}

function randomWord(length: number) {
  // Surprisingly, this very rarely creates an actual word
  let word = ''
  for (let i = 0; i < length; ++i) {
    const code = Math.floor(Math.random() * 26) + 97
    word += String.fromCharCode(code)
  }
  return word
}

/**
 * Wrapping Node filesystem functions in promises
 */
function writeFileAsync(filename: string, data: any) {
  const promise = new Promise<boolean>((resolve, reject) => {
    writeFile(filename, data, error => {
      if (error) {
        return reject(error)
      }
      resolve(true)
    })
  })
  return promise
}

function chmodAsync(filename: string, mode: number) {
  const promise = new Promise<boolean>((resolve, reject) => {
    chmod(filename, mode, error => {
      if (error) {
        return reject(error)
      }
      resolve(true)
    })
  })
  return promise
}

function unlinkAsync(filename: string) {
  const promise = new Promise<boolean>((resolve, reject) => {
    unlink(filename, error => {
      if (error) {
        return reject(error)
      }
      resolve(true)
    })
  })
  return promise
}

function spawnAsync(command: string, options: childProcess.SpawnOptions) {
  const promise = new Promise<string>((resolve, reject) => {
    let buffer = ''

    const buf = (msg: any, prefix: string) => {
      buffer += msg.toString()
    }

    const split = command.split(' ')
    const baseCommand = split[0]
    const commandArgs = split.slice(1)

    const proc = childProcess.spawn(baseCommand, commandArgs, options)

    proc.on('message', msg => buf(msg, 'ONMSG'))
    proc.on('data', msg => buf(msg, 'ONDATA'))

    proc.on('close', code => {
      if (code !== 0) {
        return reject(`Process exited with status ${code}\n${buffer}`)
      }
      resolve(buffer)
    })

    proc.on('error', err => buf(err, 'ONERROR'))
    proc.stdout.on('data', data => buf(data, 'STDOUTON'))
    proc.stderr.on('data', data => buf(data, 'STDERRON'))
  })
  return promise
}