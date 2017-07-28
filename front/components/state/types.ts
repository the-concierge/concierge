import { ContainerInfo, ImageInfo } from 'dockerode'

type HostId = { concierge: { hostId: number, host: { id: number, hostname: string, capacity: number, dockerPort: number, vanityHostname: string } } }

export type Stats = {
  memory: string
  cpu: string
  mbIn: string
  mbOut: string
}

export type Container = ContainerInfo & HostId & { stats: Stats }
export type Image = ImageInfo & HostId & { name: string }

declare const _hostId: HostId
export interface ObservableContainer {
  id: KnockoutObservable<string>
  image: KnockoutObservable<string>
  name: KnockoutObservable<string>
  restart: KnockoutObservable<string>
  status: KnockoutObservable<string>
  state: KnockoutObservable<string>
  stats: {
    mbIn: KnockoutObservable<string>,
    mbOut: KnockoutObservable<string>
    cpu: KnockoutObservable<string>
    memory: KnockoutObservable<string>
  }
  ports: KnockoutObservableArray<{ url: string, private: number }>
  host: typeof _hostId.concierge.host
}

export interface ConciergeEvent<T> {
  event: T
  name: string
  type: string
}

export interface ContainerEvent {
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

export interface CpuStats {
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

export interface MemoryStats {
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