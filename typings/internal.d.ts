/// <reference types="node" />
/// <reference path="./analysis/analysis.d.ts" />

interface Window {
  containerPoller: any
}

interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

declare const log: Logger

declare module "toastr" {
  var toastr: Toastr
  export = toastr
}

interface Toastr {
  success(message: string): void
  info(message: string): void
  warning(message: string): void
  error(message: string): void
  options: any
}

declare module Concierge {
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

  interface Registry {
    url: string
    getUntaggedImage: (application: Application) => string
    getTaggedImage: (application: Application, tag: string) => string
  }

  interface Configuration {
    name: string
    conciergePort: number
    proxyHostname?: string
    proxyIp?: string
    httpPort: number
    debug: number
    statsBinSize: number // Samples per bin at 1Hert per container
    statsRetentionDays: number // Truncate stats records older than N day(s)
    dockerRegistry?: string
  }

  interface Application {
    id: number
    name: string

    /** Autoatmically preprended image tag prefix for use during Docker image builds */
    label: string

    /** {namespace}/{repository} */
    repository: string

    /** For fetching/cloning the repository */
    key: string

    /** The Dockerfile to use in the repository when buidling the image */
    dockerfile: string
  }

  interface NewContainer {
    subdomain: string
    variant: string
    label: string
    host?: string
    volume?: Buffer
    dockerImage?: string
    applicationId?: number

    /** JSON representation of Array<string> */
    variables: string
  }

  interface Host {
    id?: number
    hostname: string
    vanityHostname: string
    capacity: number
    dockerPort: number
    sshPort: number
    sshUsername: string
    // volumesPath: string
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
      minimum: number,
      maximum: number,
      difference: number
    }
    lowerQuartile: number
    upperQuartile: number
  }

  interface SourceControlApi {
    getTags: (application: Application) => Promise<Array<string>>
    getRepository: (application: Application) => string
    privateBaseUrl: string
    publicBaseUrl: string
  }

  interface Archive {
    application: string
    filename: string
    subdomain: string
    timestamp: number
    variant: string
    date: string
  }
}

declare module 'ip' {
  const api: any
  export = api
}

declare module 'http-proxy' {
  const api: any
  export = api
}

declare module 'ssh2' {
  const api: any
  export = api
}

declare module 'tar-fs' {
  const api: {
    pack(directory: string, options?: any): NodeJS.ReadableStream
    extract(directory: string, options?: any): NodeJS.WritableStream
  }

  export = api
}

declare module 'inert' {
  const api: any
  export = api
}

declare module 'rimraf' {
  const api: any
  export = api
}

declare module 'compression' {
  namespace api { }
  function api(): any
  export = api
}

declare module 'body-parser' {
  namespace api {
    function json(): any
  }
  function api(): any
  export = api
}

interface ConciergeEvent<T> {
  event: T
  name: string
  type: string
}

/**
 * TODO: Contribute back to @types/dockerode
 */
interface ContainerEvent {
  // Internal appended properties
  cpu: string
  memory: string
  tx: string
  rx: string

  id: string
  name: string
  read: string
  preread: string
  cpu_stats: CpuStats
  precpu_stats: CpuStats
  memory_stats: MemoryStats
  networks: {
    [name: string]: {
      rx_bytes: number
      rx_dropped: number
      rx_errors: number
      rx_packets: number
      tx_bytes: number
      tx_dropped: number
      tx_errors: number
      tx_packets: number
    }
  }
}

/**
 * TODO: Contribute back to @types/dockerode
 */
interface CpuStats {
  cpu_usage: {
    percpu_usage: { [cpu: number]: number }
    total_usage: number
    usage_in_kernelmode: number
    usage_in_usermode: number
  }
  online_cpus: number
  system_cpu_usage: number
  throttling_data: {
    periods: number
    throttled_periods: number
    throttled_time: number
  }
}

/**
 * TODO: Contribute back to @types/dockerode
 */
interface MemoryStats {
  limit: number
  max_usage: number
  usage: number
  stats: {
    active_anon: number
    active_file: number
    cache: number
    dirty: number
    hierarchical_memory_limit: number
    hierarchical_memsw_limit: number
    inactive_anon: number
    inactive_file: number
    mapped_file: number
    pgfault: number
    pgmajfault: number
    pgpgin: number
    pgpgout: number
    rss: number
    rss_huge: number
    swap: number
    total_active_anon: number
    total_active_file: number
    total_cache: number
    total_dirty: number
    total_inactive_anon: number
    total_inactive_file: number
    total_mapped_file: number
    total_pgfault: number
    total_pgmajfault: number
    total_pgpgin: number
    total_pgpgout: number
    total_rss: number
    total_rss_huge: number
    total_swap: number
    total_unevictable: number
    total_writeback: number
    unevictable: number
    writeback: number
  }
}