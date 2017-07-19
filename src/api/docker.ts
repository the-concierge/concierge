import * as DockerClient from 'dockerode'

export default function getDockerClient(host: Concierge.Host, timeout?: number) {
  // If no hostname is provided, try and use the local unix socket
  if (!host.hostname) {
    const dockerClient = new DockerClient({
      socketPath: '/var/run/docker.sock',
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
