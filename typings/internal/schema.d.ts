declare namespace Schema {
  interface Concierge {
    id: number
    label: string
    hostname: string
    port: number
  }

  interface HeartBeat {
    hostId: string
    containerId: number
    cpu: string
    memory: string
    timestamp: number
  }

  interface Configuration {
    id: number
    config: string
  }

  interface Application {
    id: number
    name: string

    /** Autoatmically preprended image tag prefix for use during Docker image builds */
    label: string

    /** {namespace}/{repository} */
    repository: string

    /** The Dockerfile to use in the repository when buidling the image */
    dockerfile: string

    credentialsId?: number

    /** Whether or not the Application remotes are monitored and automatically built */
    autoBuild?: boolean
  }

  interface ApplicationRemote {
    id: number
    applicationId: number
    remote: string
    sha: string
    imageId?: string
    state: number
    seen?: string
    age: string
  }

  interface Credentials {
    id: number
    name: string
    username: string
    key: string
  }

  interface Host {
    id?: number
    hostname: string
    proxyIp: string
    vanityHostname: string
    capacity: number
    dockerPort: number
    sshPort: number
    credentialsId?: number | null
  }
}
