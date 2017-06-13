import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as path from 'path'
import api from './api'
import errorHandler from './error-handler'
import menu from '../../front/components/menu'
import v2Router from '../api'
import * as http from 'http'
import * as io from 'socket.io'

const app = express()

export const server = http.createServer(app)

export const socket = io(server)

const router = express.Router()

export default function start() {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3141
    server.listen(port, err => {
      if (err) {
        return reject(err)
      }
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

router.use('/api', api)
router.use('/v2', v2Router)

app.use(router)

const staticPath = path.resolve(__dirname, '..', '..', 'front')
for (const item of menu.items()) {
  app.use(item.url[0], (_, res) => res.sendFile(path.resolve(staticPath, 'index.html')))
}

app.use(express.static(staticPath))

// 404 handler
app.use('/', (_, res) => {
  res.status(404)
  res.sendFile(path.resolve(staticPath, 'index.html'))
  return
})

app.use(errorHandler)