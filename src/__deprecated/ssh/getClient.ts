import * as SSH2 from 'ssh2'

/**
 * Create an instance of a connect SSH client ready for consumption
 */
export default function getClient(host: Concierge.Host): Promise<any> {
  let client = new SSH2.Client()

  let settings: any = {
    host: host.hostname,
    port: host.sshPort,
    username: host.sshUsername
  }

  let hasPassword = host.privateKey.length < 30

  if (hasPassword) {
    settings.password = host.privateKey
  } else {
    settings.privateKey = host.privateKey
  }

  client.connect(settings)

  let promise = new Promise((resolve, reject) => {
    client.on('ready', () => {
      resolve(client)
    })

    client.on('error', error => {
      reject('[SSH] ' + error)
    })
  })

  return promise
}
