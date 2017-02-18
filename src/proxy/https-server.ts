import * as httpProxy from 'http-proxy'
import * as https from 'https'
import * as fs from 'fs'
import getConfigCache, { get as getConfig } from '../api/configurations/get'
import { all as getContainers, bySubdomain as getContainerBySubdomain } from '../api/containers/get'
import * as tls from 'tls'
import * as log from '../logger'
import Container = Concierge.Container
import getIP from './get-ip'
import { getCertPath, getKeyPath } from './certificate-path'
import createCertificate from './create-certificate'
import certificateExists from './certificate-exists'
import { startServer as challengeServer } from './challenge-server'
import getDomainInfo from './domain-info'
import closeAsync from './close'

const secureContextCache: { [domain: string]: tls.SecureContext } = {}
let webServer: https.Server
let proxyServer: https.Server & { web: any, ws: any }
let running: boolean = false

/** Destructive */
async function startServer() {
  if (running === true) {
    return
  }

  webServer = await createProxyServer()
  challengeServer()

  const containers = await getContainers()
  const config = await getConfig()

  const fullDomain = (container: Container) => `${container.subdomain}.${config.proxyHostname}`

  /** Cache secure contexts */
  for (const container of containers) {
    const domain = fullDomain(container)
    const hasCertificate = await (certificateExists(domain))

    if (hasCertificate) {
      const secureContext = getSecureContext(domain)
      return secureContext
    }
    try {
      await createCertificate(domain)
      const secureContext = getSecureContext(domain)
      return secureContext
    } catch (ex) {
      log.error(`Failed to created certificate for ${domain}:`)
      log.error(ex.message || ex)
    }
  }
  running = true
}

async function stopServer() {
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

export default {
  startServer,
  stopServer
}

/**
 * This is only ever executed inside a fiber
 * It is to safe to use await() here
 */
async function createProxyServer() {
  log.info('Attempting to start HTTPS server...')
  const config = getConfigCache()

  const server = https.createServer({
    SNICallback: getSecureContext
  }, (request, response) => {
    const domainInfo = getDomainInfo(request.headers.host)
    getContainerBySubdomain(domainInfo.subdomain)
      .then(container => {
        if (container.port === 0) {
          response.statusCode = 503
          response.statusMessage = 'Service unavailable: Container not available'
          response.write('Service unavailable: Container not available')
          response.end()
          return
        }
        const target = getContainerUrl(container)
        proxyServer.web(request, response, { target })
      })
  })

  const serverIp = await getIP()
  server.listen(config.httpsPort, serverIp, err => {
    if (err) {
      log.error(`Failed to start HTTPS proxy server: ${err}`)
      return
    }
    proxyServer = httpProxy.createServer({})
    proxyServer.on('upgrade', webSocketHandler)
    log.info('Started HTTPS proxy server on ' + serverIp + ':' + config.httpsPort)
  })

  return server
}

async function webSocketHandler(request, socket, head) {
  const info = getDomainInfo(request.headers.host)
  const container = await getContainerBySubdomain(info.subdomain)

  if (container.isProxying === 0) {
    // Contaier is not proxying, do not proxy
    return
  }

  if (container.port === 0) {
    // Container is not available, do not proxy
    return
  }
  const target = getContainerUrl(container)
  proxyServer.ws(request, socket, head, { target })
}

function getSecureContext(domain: string, callback?: (error, context) => void) {
  let context
  if (secureContextCache[domain]) {
    context = secureContextCache[domain].context
  } else {
    // We only do this once per server, so the blocking overhead is probably acceptable
    const cert = fs.readFileSync(getCertPath(domain))
    const key = fs.readFileSync(getKeyPath(domain))
    const secureContext = tls.createSecureContext({
      cert, key
    })

    secureContextCache[domain] = secureContext
    context = secureContextCache[domain]
  }
  if (callback) {
    callback(null, context)
  }
  return context
};

function getContainerUrl(container: Concierge.Container) {
  let url = [
    'http://',
    container.host,
    ':',
    container.port
  ]

  return url.join('')
}
