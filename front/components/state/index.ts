import * as ko from 'knockout'
import { ContainerInfo } from 'dockerode'
import * as io from 'socket.io-client'
import * as analysis from 'analysis'

const socket = io()

export type Stats = {
  memory: string
  cpu: string
  mbIn: string
  mbOut: string
}

export type Container = ContainerInfo & { stats: Stats } & { concierge: { hostId: string } }

class StateManager {
  containers = ko.observableArray<Container>([])
  hosts = ko.observableArray<Concierge.APIHost>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])

  constructor() {
    this.getContainers()
    this.getHosts()

    socket.on('stats', (event: ConciergeEvent) => {
      const container = this.containers().find(container => container.Id === event.name)
      if (!container) {
        return
      }

      const memStats = event.event.memory_stats
      const memory = (memStats.usage / 1024 / 1024) / (memStats.limit / 1024 / 1024) * 100
      const memPercent = analysis.common.round(memory, 2)
      container.stats.memory = memPercent.toString() + '%'

      const postCpuStats = event.event.cpu_stats
      const preCpuStats = event.event.precpu_stats
      const x = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage
      const y = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage
      const cpuPercent = analysis.common.round((x / (x + y) * 100), 2)
      container.stats.cpu = cpuPercent.toString() + '%'

      const eth0 = event.event.networks['eth0']
      if (eth0) {
        container.stats.mbIn = analysis.common.round(eth0.rx_bytes / 1024 / 1024, 2) + 'MB'
        container.stats.mbOut = analysis.common.round(eth0.tx_bytes / 1024 / 1024, 2) + 'MB'
      }

      const newContainer = { ...container }

      this.containers.replace(container, newContainer)
    })
  }

  /**
   * TODO:
   * Update objects instead of replacing them all
   */

  getContainers = () =>
    fetch('/v2/hosts/containers')
      .then(res => res.json())
      .then(containers => {
        this.containers.destroyAll()
        containers.forEach(container => {
          const stats: Stats = {
            cpu: '...',
            memory: '...',
            mbIn: '...',
            mbOut: '...'
          }

          container.stats = stats
        })
        this.containers.push(...containers)
      })

  getHosts = () => {
    fetch('/v2/hosts')
      .then(res => res.json())
      .then(hosts => {
        this.hosts.destroyAll()
        this.hosts.push(...hosts)
      })
  }
}

const state = new StateManager()

interface ConciergeEvent {
  event: ContainerEvent
  name: string
  type: string
}

interface ContainerEvent {
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

export default state
