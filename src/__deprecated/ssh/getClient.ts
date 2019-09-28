import * as SSH2 from 'ssh2'
import { readFileSync } from 'fs'
import * as net from 'net'
import { reject } from 'bluebird'

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

async function test() {
  const host = {
    hostname: 'winkler.id.au',
    sshPort: 22,
    sshUsername: 'carl',
    privateKey: readFileSync('/Users/carl/.ssh/do.id_rsa').toString()
  }

  const client = await getClient(host)
  // client.exec(
  //   `sudo docker ps --format \"{{.ID}},{{.Names}},{{.Ports}},{{.Image}}\"`,
  //   (err, stream) => {
  //     if (stream) {
  //       stream.on('data', d => {
  //         if (d) {
  //           console.log(d.toString())
  //         }
  //       })
  //     }
  //   }
  // )
  client.exec(
    `sudo docker stats --format "{{.ID}},{{.Name}},{{.CPUPerc}},{{.MemUsage}}"`,
    (err, stream) => {
      if (stream) {
        stream.on('data', d => {
          if (d) {
            console.log(d.toString())
          }
        })
      }
    }
  )
}

test()

function getPort() {
  return new Promise(resolve => {
    const srv = net.createServer({})
    srv.on('error', () => {
      resolve(false)
    })

    srv.listen(0, () => {
      const port = srv.address().port
      srv.close()
      if (!port) {
        return reject('Unable to get port')
      }

      return resolve(port)
    })
  })
}
