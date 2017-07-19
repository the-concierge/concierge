import state, { ObservableContainer } from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'

class Containers {
  containers = state.containers

  hosts = ko.computed(() => {
    const hosts = state
      .hosts()
      .map(host => ({ id: host.id, hostname: host.hostname }))

    return [
      { id: 0, hostname: 'Show contaiers for all hosts' },
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

  modalActive = ko.observable(false)

  currentContainer = ko.observable<string | undefined>()

  defaultModalContainer: ObservableContainer = {
    id: ko.observable('...'),
    name: ko.observable('...'),
    image: ko.observable('...'),
    state: ko.observable('...'),
    status: ko.observable('...'),
    stats: {
      mbIn: ko.observable('...'),
      mbOut: ko.observable('...'),
      cpu: ko.observable('...'),
      memory: ko.observable('...')
    },
    ports: ko.observableArray([]),
    host: {
      capacity: 0,
      dockerPort: 0,
      hostname: '...',
      id: 0,
      vanityHostname: '...'
    }
  }

  modalContainer = ko.computed((): ObservableContainer => {
    const id = this.currentContainer()
    if (!id) {
      return this.defaultModalContainer
    }

    const container = this.containers().find(c => c.id().startsWith(id))
    return container
  })

  showStartButton = ko.computed(() => this.modalContainer().state() === 'exited')
  showStopButton = ko.computed(() => this.modalContainer().state() === 'running')
  containerWaiting = ko.observable(false)
  buttonLoading = ko.observable('')

  /**
   * TODO:
   * - Add UI feedback for container control
   * - Remove deleted containers somehow? If they don't appear in 'getContainers', just remove them?
   */

  loading = () => {
    this.containerWaiting(true)
  }

  resetButtons = () => {
    this.buttonLoading('')
    this.containerWaiting(false)
  }

  modifyContainer = async (command: string, method: string = 'GET') => {
    const container = this.modalContainer()
    const route = `/api/containers/${container.id()}/${command}/${container.host.id}`
    this.loading()
    const res = await fetch(route, { method })
    const result = await res.json()
    if (res.status >= 400) {
      state.toast.error(`Failed to start container: ${result.message}`)
    }
    this.resetButtons()
    return result
  }

  stopContainer = async () => this.modifyContainer('stop')
  startContainer = async () => this.modifyContainer('start')
  removeContainer = async () => this.modifyContainer('host', 'DELETE')
    .then(() => this.currentContainer(''))
    .then(() => this.hideModal())

  showModal = (container: ObservableContainer) => {
    this.currentContainer(ko.unwrap(container).id())
    this.modalActive(true)
  }

  hideModal = () => this.modalActive(false)
}

const viewModel = new Containers()

ko.components.register('ko-containers', {
  template: fs.readFileSync(`${__dirname}/containers.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})
