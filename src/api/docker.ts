import * as DockerClient from 'dockerode'
import * as process from 'process'

export default function getDockerClient(host: Concierge.Host, timeout?: number) {
  // If no hostname is provided, try and use the local unix socket
  if (!host.hostname) {
    const socketPath = process.platform === 'win32'
      ? '//./pipe/docker_engine'
      : '/var/run/docker.sock'

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
