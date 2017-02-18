import httpServer from './http-server'

export default async function startProxy() {
  await httpServer.startServer()
}