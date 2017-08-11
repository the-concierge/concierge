import * as http from 'http'
import * as log from '../logger'
import * as HTTPProxy from 'http-proxy'
import { getConfig } from '../api/configuration/db'
import findContainer from './find-container'
import getIP from './get-ip'
import closeAsync from './close'

let webServer: http.Server
let proxyServer: http.Server & { web: any, ws: any }
let running: boolean = false

export async function startServer() {
  if (running === true) {
    return
  }

  log.info('Attempting to start HTTP proxy server...')
  const config = await getConfig()
  const serverIp = await getIP()
  webServer = http.createServer(requestHandler)
  webServer.listen(config.httpPort, serverIp, () => {
    proxyServer = HTTPProxy.createProxyServer({})

    proxyServer.on('error', error => {
      log.error('[PROXY] ' + error)
    })

    log.info(`Started HTTP proxy server on ${serverIp}:${config.httpPort}`)
  })

  webServer.on('upgrade', webSocketHandler)

  webServer.on('error', error => {
    log.error('Failed to start HTTP proxy server: ' + error)
  })

  running = true
}

export async function stopServer() {
  if (running === false) {
    return
  }

  if (!webServer && !proxyServer) {
    return
  }

  await closeAsync(webServer)
  await closeAsync(proxyServer)
  running = false
}

export function restartServer() {
  return new Promise(resolve => {
    const closeHandler = () => {
      if (!proxyServer) {
        return
      }

      proxyServer.close(() => {
        log.info('Proxy server suspended')
        resolve()
      })
    }
    webServer.close(closeHandler)
  }).then(startServer)
}

async function webSocketHandler(request: http.ServerRequest, socket, head) {
  // const info = getDomainInfo(request.headers.host)
  const container = await findContainer(request.headers.host)
  if (!container) {
    errorResponse(socket, 'Container not found')
    return
  }

  const info = getProxyInfo(request.headers.host)
  const target = `${container.concierge.host}:${info.port}`
  proxyServer.ws(request, socket, head, { target })
}

async function requestHandler(request: http.ServerRequest, response: http.ServerResponse) {
  const info = getProxyInfo(request.headers.host)
  const config = await getConfig()

  if (config.proxyHostname.toLowerCase() !== info.hostname) {
    errorResponse(response, 'Bad hostname')
    return
  }

  const container = await findContainer(info.name)
  if (!container) {
    errorResponse(response, 'Container not available')
    return
  }

  const port = container.Ports.find(port => port.PrivatePort === info.port)
  if (!port) {
    errorResponse(response, 'Port not found on container')
    return
  }

  const destHostname = container.concierge.host.vanityHostname || container.concierge.host.hostname
  const targetUrl = `http://${destHostname}:${port.PublicPort}`
  proxyServer.web(request, response, {
    target: targetUrl
  })
}

function errorResponse(response: any, error) {
  response.statusCode = 503
  response.statusMessage = 'Service unavailable: ' + error
  response.write('Service unavailable: ' + error)
  response.end()
}

function getProxyInfo(hostname: string) {
  /**
   * Expected hostname format:
   * [container name]-[port].[proxy hostname]
   */
  const split = hostname.split('.')

  const idSplits = split[0].split('-')
  const name = idSplits.slice(0, -1).join('-').toLowerCase()
  const port = Number(idSplits.slice(-1)[0])

  const proxyHostname = (split
    .slice(1)
    .join('.')
    .split(':')[0] || '').toLowerCase()

  return {
    name,
    port,
    hostname: proxyHostname
  }
}