import * as ko from 'knockout'
import state from '../../state'
import { activeContainer } from '../common'

class Logs {
  container = activeContainer
  follow = ko.observable(false)
  logs = ko.observableArray<string>([])
  tail = ko.observable(50)

  constructor() {
    activeContainer.subscribe(container => {
      if (!container.id() || container.id() === '...') {
        return
      }

      this.getLogs()
    })
  }

  getLogs = async () => {
    const result = await fetch(
      `/api/containers/${this.container().id()}/logs/${this.container().host
        .id}?tail=${this.tail()}`
    )
    if (result.status >= 400) {
      state.toast.error(`Failed to retrieve container logs: ${result.statusText}`)
      return
    }

    const logs: string[] = await result.json()

    const flattenedLogs = logs
      .reduce((prev, entry) => prev.concat(entry.split('\n')), [] as string[])
      .filter(line => !!line.trim())

    this.logs.removeAll()
    this.logs(flattenedLogs)
  }
}

const viewModel = new Logs()

ko.components.register('ko-container-logs', {
  template: require('./logs.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
