import * as http from 'http'
import * as https from 'https'

export default function closeServerAsync(server?: http.Server | https.Server) {
  if (!server) {
    return Promise.resolve()
  }
  return new Promise<void>(resolve => {
    server.close()
  })
}