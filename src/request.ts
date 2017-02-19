import * as http from 'http'
import * as https from 'https'
const pkg = require('../package')

function request(url: string, httpModule: any, options: any): Promise<string> {
  options = options || { method: 'GET' }
  let urlOptions = urlToOptions(url)
  options.hostname = urlOptions.hostname
  options.port = urlOptions.port || null
  options.path = urlOptions.path
  options.headers = options.headers || {}
  options.headers['User-Agent'] = options.headers['User-Agent'] || `Concierge ${pkg.version}`

  options.asString = !options.asString ? true : options.asString

  let promise = new Promise<string>((resolve, reject) => {
    let body = ''
    let buffers = []
    let httpRequest = httpModule.request(options, response => {
      response.on('end', () => {
        if (options.asString) {
          return resolve(body as any)
        }
        resolve(Buffer.concat(buffers) as any)
      })
      response.on('data', data => {
        if (options.asString) {
          body += data.toString()
          return
        }
        buffers.push(data)
      })

    })

    httpRequest.setTimeout(options.timeout || 1500)

    httpRequest.on('timeout', () => {
      // log.warn(`${url}: Request timed out`);
      httpRequest.abort()
    })

    httpRequest.on('error', err => reject(`Request failed: ${err}`))

    httpRequest.end()
  })

  return promise
}

export function get(url: string, options?: any) {
  return request(url, http, options)
}

export function getHttps(url: string, options?: any) {
  return request(url, https, options)
}

export function post(url: string, options?: any) {
  options = options || {}
  options.method = 'POST'
  return request(url, http, options)
}

export function postHttps(url: string, options?: any) {
  options = options || {}
  options.method = 'POST'
  return request(url, https, options)
}

export function del(url: string, options?: any) {
  options = options || {}
  options.method = 'DELETE'
  return request(url, http, options)
}

export function delHttps(url: string, options?: any) {
  options = options || {}
  options.method = 'DELETE'
  return request(url, https, options)
}

export function put(url: string, options?: any) {
  options = options || {}
  options.method = 'PUT'
  return request(url, http, options)
}

export function putHttps(url: string, options?: any) {
  options = options || {}
  options.method = 'PUT'
  return request(url, https, options)
}

function urlToOptions(url: string): { hostname: string, path?: string, port?: number } {
  url = url.replace('http://', '')
  url = url.replace('https://', '')

  let split = url.split('/')
  let hostSplit = split[0].split(':')

  let opts: any = {
    hostname: hostSplit[0]
  }

  if (hostSplit[1]) {
    opts.port = hostSplit[1]
  }
  if (split.length === 1) {
    return opts
  }

  opts.path = '/' + split.slice(1).join('/')
  return opts
}