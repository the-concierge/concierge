import state, { Container } from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'

class Containers {
  containers = state.containers

  modalActive = ko.observable(false)

  currentContainer = ko.observable<string | undefined>()

  modalContainer = ko.computed(() => {
    const id = this.currentContainer()
    if (!id) {
      return {
        Host: '',
        Id: '',
        Names: [],
        Image: '',
        State: '',
        Status: ''
      } as any
    }

    return this.containers().find(c => c.Id === id)
  })

  modalName = ko.computed(() => {
    const container = this.modalContainer()
    const names = container.Names || []
    return (names[0] || '').slice(1)
  })

  showStartButton = ko.computed(() => this.modalContainer().State === 'exited')
  showStopButton = ko.computed(() => this.modalContainer().State === 'running')
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

  modifyContainer = async (command: string) => {
    const container = this.modalContainer()
    const route = `/v2/containers/${container.Id}/${command}/${container.concierge.hostId}`
    this.loading()
    const res = await fetch(route)
    this.resetButtons()
    return res.json()
  }

  stopContainer = async () => this.modifyContainer('stop')
  startContainer = async () => this.modifyContainer('start')
  removeContainer = async () => this.modifyContainer('remove')
    .then(() => this.currentContainer(''))
    .then(() => this.hideModal())

  showModal = (container: Container) => {
    this.currentContainer(ko.unwrap(container).Id)
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
