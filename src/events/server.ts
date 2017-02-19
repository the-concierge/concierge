import * as http from 'http'
import * as socketIo from 'socket.io'
import web from '../server'

export let server: SocketIO.Server

export function start() {
  const httpServer = http.createServer(web)
  server = socketIo(httpServer)
  return true
}