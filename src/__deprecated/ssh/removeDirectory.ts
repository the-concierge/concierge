import getSshClient from './getClient'

/**
 * Delete a directry on a Host
 */
export default function remove(host: Concierge.Host, path: string): Promise<boolean> {
  return getSshClient(host).then(client => removeDirectory(client, path))
}

function removeDirectory(client, path: string) {
  let promise = new Promise<boolean>((resolve, reject) => {
    if (!path || path.length < 2) {
      return reject('Invalid path specified')
    }

    function rmdirHandler(error, response) {
      client.end()
      if (error) {
        return reject('[REMOVEDIR] Failed to remove directory: ' + error)
      }
      resolve(true as any)
    }

    client.exec('rm -rf ' + path, rmdirHandler)
  })

  return promise
}
