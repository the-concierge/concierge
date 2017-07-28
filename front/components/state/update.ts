import { ObservableContainer } from './types'

export default function updateContainer(container: ObservableContainer, event: ConciergeEvent<ContainerEvent>) {
  const { cpu, memory, rx, tx } = event.event
  container.stats.cpu(cpu)
  container.stats.memory(memory)
  container.stats.mbIn(rx)
  container.stats.mbOut(tx)
}