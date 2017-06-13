import state, { Container } from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'
import './container'

class Containers {
  containers = state.containers

  modalActive = ko.observable(false)

  modalContainer = ko.observable<Container>({
    Host: '',
    Id: '',
    Names: [],
    Image: '',
    State: '',
    Status: ''
  } as any)
  modalName = ko.computed(() => {
    const container = this.modalContainer()
    const names = container.Names || []
    return (names[0] || '').slice(1)
  })

  showStartButton = ko.computed(() => this.modalContainer().State === 'exited')
  showStopButton = ko.computed(() => this.modalContainer().State === 'running')

  /**
   * TODO:
   * - Add UI feedback for container control
   * - Remove deleted containers somehow? If they don't appear in 'getContainers', just remove them?
   */

  stopContainer = () => {
    const container = this.modalContainer()
    const route = `/v2/containers/${container.Id}/host/${container.concierge.hostId}`
    return fetch(route)
      .then(res => res.json())
  }

  startContainer = () => {
    const container = this.modalContainer()
    const route = `/v2/containers/${container.Id}/host/${container.concierge.hostId}`
    return fetch(route)
      .then(res => res.json())
  }

  showModal = (container: Container) => {
    this.modalContainer(container)
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
