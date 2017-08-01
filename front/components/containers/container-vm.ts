import * as ko from 'knockout'
import * as fs from 'fs'
import state, { ObservableContainer } from '../state'
import inspect from './inspect'

class Containers {
  containers = state.containers

  hosts = ko.computed(() => {
    const hosts = state
      .hosts()
      .map(host => ({ id: host.id, hostname: host.vanityHostname || host.hostname }))

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

  inspectContainer = (container: ObservableContainer) => {
    window.history.pushState({}, 'Concierge', '/inspect')
    try {
      window.dispatchEvent(new Event('push-state'))
    } catch (ex) {
      window.dispatchEvent(new CustomEvent('push-state'))
    }

    inspect.inspect(container)
  }
}

const viewModel = new Containers()

ko.components.register('ko-containers', {
  template: fs.readFileSync(`${__dirname}/containers.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})
