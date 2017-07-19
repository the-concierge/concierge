import { ConciergeEvent, ContainerEvent, ObservableContainer } from './types'
import * as analysis from 'analysis'

export default function updateContainer(container: ObservableContainer, event: ConciergeEvent<ContainerEvent>) {
  const memStats = event.event.memory_stats
  const memory = (memStats.usage / 1024 / 1024) / (memStats.limit / 1024 / 1024) * 100
  const memPercent = analysis.common.round(memory, 2)
  container.stats.memory(isNaN(memPercent) ? '...' : memPercent.toString() + '%')

  const postCpuStats = event.event.cpu_stats
  const preCpuStats = event.event.precpu_stats
  const x = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage
  const y = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage
  const cpuPercent = analysis.common.round((x / (x + y) * 100), 2)
  container.stats.cpu(isNaN(cpuPercent) ? '...' : cpuPercent.toString() + '%')

  const networks = event.event.networks || {}
  const eth0 = networks['eth0']
  if (eth0) {
    container.stats.mbIn(analysis.common.round(eth0.rx_bytes / 1024 / 1024, 2) + 'MB')
    container.stats.mbOut(analysis.common.round(eth0.tx_bytes / 1024 / 1024, 2) + 'MB')
  }

  const newContainer = { ...container }
  return newContainer
}