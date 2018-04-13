/// <reference types="node" />
/// <reference path="../analysis/analysis.d.ts" />

declare module '*.vue' {
  const component: any
  export default component
}

interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

declare const log: Logger

declare namespace NodeJS {
  interface Global {
    log: Logger
  }
}

declare namespace Concierge {
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
    name: string
    conciergePort: number
    proxyHostname?: string
    debug: number
    statsBinSize: number // Samples per bin at 1Hert per container
    statsRetentionDays: number // Truncate stats records older than N day(s)
    dockerRegistry?: string
    registryCredentials?: number
  }

  interface Application {
    id: number
    name: string

    /** Autoatmically preprended image tag prefix for use during Docker image builds */
    label: string

    /** {namespace}/{repository} */
    repository: string

    /** Username for http/https git repositories */
    username: string

    /** For fetching/cloning the repository */
    key: string

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

  interface ApplicationDTO extends Application {
    credentialsName: string
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
    sshUsername: string
    privateKey?: string
  }

  interface Entity {
    type: string
    name: string
  }

  interface Event extends Entity {
    event: any
  }

  interface Stats {
    containerId: number
    cpu: Box
    memory: Box
    responseTime: number
    timestamp: number
  }

  interface Box {
    mean: number
    mode: number[]
    median: number
    range: {
      minimum: number
      maximum: number
      difference: number
    }
    lowerQuartile: number
    upperQuartile: number
  }

  interface QueueItem {
    app: {
      id: number
      name: string
    }
    ref: string
    sha: string
    state: string
    stateId: number
  }
}

interface ConciergeEvent<T> {
  event: T
  name: string
  type: string
}

interface BuildStatusEvent {
  applicationId: number
  age: string
  remote: string
  sha: string
  seen?: string
  imageId?: string
  state: number
}
