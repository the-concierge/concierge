import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'
import inspect from './inspect'

class Containers {
  containers = state.containers
  inspectContainer = inspect.inspect

  hosts = ko.computed(() => {
    const hosts = state
      .hosts()
      .map(host => ({ id: host.id, hostname: host.hostname }))

    return [
      { id: 0, hostname: 'Show containers for all hosts' },
      ...hosts
    ]
  })

  selectedHost = ko.observable(this.hosts()[0])

  filteredContainers = ko.computed(() => {
    const host = this.selectedHost()
    const containers = this.containers()
    if (host.id === 0) {
      return containers
    }

    return containers.filter(container => container.host.id === host.id)
  })
}

const viewModel = new Containers()

ko.components.register('ko-containers', {
  template: fs.readFileSync(`${__dirname}/containers.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})
