import * as DockerClient from 'dockerode'
import * as process from 'process'
import { get as getConfig } from './configuration/db'
import { one as getCreds } from './credentials/db'

export default function getDockerClient(host: Schema.Host, timeout?: number) {
  // If no hostname is provided, try and use the local unix socket
  if (!host.hostname) {
    const socketPath =
      process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'

    const dockerClient = new DockerClient({
      socketPath,
      timeout: timeout || 0
    })
    return dockerClient
  }

  const dockerClient = new DockerClient({
    host: host.hostname,
    port: host.dockerPort || 2375,
    protocol: 'http',
    timeout: timeout || 0
  })

  return dockerClient
}

export async function getAuthConfig() {
  const cfg = await getConfig()
  if (!cfg.registryCredentials) {
    return {
      auth: ''
    }
  }

  const creds = await getCreds(cfg.registryCredentials)
  const authConfig = creds.username
    ? { username: creds.username, password: creds.key }
    : { key: creds.key }

  return {
    auth: '',
    serveraddress: cfg.dockerRegistry!,
    ...authConfig
  }
}
