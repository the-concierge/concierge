import getClient from './getClient'

/**
 * Execute a shell command on a Host
 */
export default async function exec(host: Concierge.Host, command: string) {
  const client = await getClient(host)

  const promise = new Promise<boolean>((resolve, reject) => {
    client.exec(command, (error, stream: NodeJS.ReadableStream) => {
      if (error) {
        return reject(error)
      }

      stream.on('exit', (code, signal) => {
        if (typeof code === 'number' && code !== 0) {
          log.error(`[SSH.EXEC] Failed to execute: ${command}`)
          return reject(`Remote process exited with code ${code}`)
        }

        if (signal) {
          log.error(`[SSH.EXEC] Failed to execute: ${command}`)
          return reject(`Remove process killed with signal ${signal}`)
        } else {
          resolve(true)
        }
      }).resume()
    })
  })
  return await (promise)
}