import * as http from 'http'
import * as HTTPProxy from 'http-proxy'
import { getConfig } from '../../api/configuration/db'
import findContainer from './find-container'

const proxyServer: http.Server & { web: any, ws: any } = HTTPProxy.createProxyServer({})

proxyServer.on('error', error => {
  log.error('[PROXY] ' + error)
})

export async function webSocketHandler(request: http.ServerRequest, socket, head) {
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

export async function requestHandler(request: http.ServerRequest, response: http.ServerResponse, next: (nextArg?: any) => void) {
  const info = getProxyInfo(request.headers.host)
  const config = await getConfig()

  if (config.proxyHostname.toLowerCase() !== info.hostname) {
    return next()
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

  const destHostname = container.concierge.host.proxyIp || container.concierge.host.hostname || '127.0.0.1'
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