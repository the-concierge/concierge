import * as ko from 'knockout'
import * as fs from 'fs'
import state, { ObservableContainer } from '../../state'

class Inspect {
  containerId = ko.observable('')
  modalActive = ko.observable(false)

  defaultContainer: ObservableContainer = {
    id: ko.observable('...'),
    name: ko.observable('...'),
    image: ko.observable('...'),
    state: ko.observable('...'),
    status: ko.observable('...'),
    restart: ko.observable(''),
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

  container = ko.computed(() => {
    const id = this.containerId()
    if (!id) {
      return this.defaultContainer
    }

    const container = state
      .containers()
      .find(container => container.id() === id)

    return container || this.defaultContainer
  })

  showStartButton = ko.computed(() => this.container().state() === 'exited')
  showStopButton = ko.computed(() => this.container().state() === 'running')
  containerWaiting = ko.observable(false)
  buttonLoading = ko.observable('')

  inspect = (container: ObservableContainer) => {
    this.containerId(ko.unwrap(container.id))
    this.modalActive(true)
  }

  hideModal = () => this.modalActive(false)

  loading = () => {
    this.containerWaiting(true)
  }

  resetButtons = () => {
    this.buttonLoading('')
    this.containerWaiting(false)
  }

  modifyContainer = async (command: string, method: string = 'GET') => {
    const container = this.container()
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
    .then(() => this.containerId(''))
    .then(() => this.hideModal())
}

const viewModel = new Inspect()

ko.components.register('ko-inspect-container', {
  template: fs.readFileSync(`${__dirname}/inspect.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel