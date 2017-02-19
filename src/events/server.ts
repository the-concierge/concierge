import * as socketIo from 'socket.io'
import web from '../server'

export let server: SocketIO.Server

export function start() {
  server = socketIo(web)
  return Promise.resolve(true)
}