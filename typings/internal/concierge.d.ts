declare namespace Concierge {
  interface Configuration {
    name: string
    conciergePort: number
    proxyHostname?: string
    debug: number
    statsBinSize: number // Samples per bin at 1Hz per container
    statsRetentionDays: number // Truncate stats records older than N day(s)
    dockerRegistry?: string
    registryCredentials?: number

    maxConcurrentBuilds: number
    gitPollingIntervalSecs: number
  }

  interface ApplicationDTO extends Schema.Application {
    credentialsName: string
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
