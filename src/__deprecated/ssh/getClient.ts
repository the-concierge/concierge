import * as SSH2 from 'ssh2'

/**
 * Create an instance of a connect SSH client ready for consumption
 */
export default function getClient(host: Schema.Host): Promise<any> {
  const client = new SSH2.Client()

  const settings: any = {
    host: host.hostname,
    port: host.sshPort,
    username: host.sshUsername
  }

  const hasPassword = host.privateKey.length < 30

  if (hasPassword) {
    settings.password = host.privateKey
  } else {
    settings.privateKey = host.privateKey
  }

  client.connect(settings)

  const promise = new Promise((resolve, reject) => {
    client.on('ready', () => {
      resolve(client)
    })

    client.on('error', error => {
      reject('[SSH] ' + error)
    })
  })

  return promise
}
