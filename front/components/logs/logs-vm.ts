import * as ko from 'knockout'
import Monitor from '../state/monitor'
import state from '../state'
import menu from '../menu'

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
  template: require('./logs.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

menu.register({
  path: '/logs',
  item: { component: 'ko-logs', name: 'Logs' },
  position: 70
})
