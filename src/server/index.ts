import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as path from 'path'
import v2Router from '../api'
import * as http from 'http'
import * as io from 'socket.io'
import * as proxy from './proxy'
import { port } from '../configurations/port'

const app = express()

export const server = http.createServer(app as any)

export const socket = io(server)

const router = express.Router()

export default function start() {
  return new Promise((resolve, reject) => {
    server.listen(port, (err: any) => {
      if (err) {
        return reject(err)
      }
      log.info(`HTTP server started on port ${port}`)
      resolve(port)
    })
  })
}

/**
 * TODO
 * Authentication
 * Signed cookies
 */

app.use(compression())
app.use(bodyParser.json())

router.use('/api', v2Router)

app.use(proxy.requestHandler)

app.use(router)

const staticPath = path.resolve(__dirname, '..', '..', 'front')
app.use(express.static(staticPath))

// 404 handler -- return index.html and use client-side routing
app.use((_, res) => {
  res.sendFile(path.resolve(staticPath, 'index.html'))
  return
})
