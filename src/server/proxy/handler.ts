import * as http from 'http'
import * as HTTPProxy from 'http-proxy'
import { get as getConfig } from '../../api/configuration/db'
import findContainer from './find-container'

const proxyServer: http.Server & { web: any; ws: any } = HTTPProxy.createProxyServer({})

proxyServer.on('error', error => {
  log.error('[PROXY] ' + error)
})

proxyServer.on('proxyReq', (proxyReq: any, req: any) => {
  if (req.body && req.headers['content-type'] === 'application/json') {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    proxyReq.setHeader('Content-Type', 'application/json')
    proxyReq.setHeader('Content-Length', Buffer.byteLength(body))
    proxyReq.write(body)
  }
})

export async function webSocketHandler(request: http.ServerRequest, socket: any, head: any) {
  // const info = getDomainInfo(request.headers.host)
  const container = await findContainer(request.headers.host)
  if (!container) {
    errorResponse(socket, 'Container not found')
    return
  }

  const info = getProxyInfo(request.headers.host || '')
  const target = `${container.concierge.host}:${info.port}`
  proxyServer.ws(request, socket, head, { target })
}

type ServerRequest = http.ServerRequest & { body?: any }

export async function requestHandler(
  request: ServerRequest,
  response: http.ServerResponse,
  next: (nextArg?: any) => void
) {
  const info = getProxyInfo(request.headers.host || '')
  const config = await getConfig()

  if ((config.proxyHostname || '').toLowerCase() !== info.hostname) {
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

  const destHostname =
    container.concierge.host.proxyIp || container.concierge.host.hostname || '127.0.0.1'
  const targetUrl = `http://${destHostname}:${port.PublicPort}`

  const options: any = {
    target: targetUrl
  }

  if (request.body) {
    // Do something different
    request.body = JSON.stringify(request.body)
  }

  proxyServer.web(request, response, options)
}

function errorResponse(response: any, error: any) {
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
  const name = idSplits
    .slice(0, -1)
    .join('-')
    .toLowerCase()
  const port = Number(idSplits.slice(-1)[0])

  const proxyHostname = (split
    .slice(1)
    .join('.')
    .split(':')[0] || ''
  ).toLowerCase()

  return {
    name,
    port,
    hostname: proxyHostname
  }
}
