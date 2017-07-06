import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'
import Monitor from '../state/monitor'

class Logs {
  monitors = state.monitors
  selectedMonitor = ko.observable<Monitor<string>>()

  monitorEntries = ko.computed(() => {
    const monitor = this.selectedMonitor()
    if (!monitor) {
      return []
    }
    return monitor.entries()
  })
}

const viewModel = new Logs()

ko.components.register('ko-logs', {
  template: fs.readFileSync(`${__dirname}/logs.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})