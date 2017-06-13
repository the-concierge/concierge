import { ContainerInfo } from 'dockerode'
import state from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'
import './container'

class Containers {
  containers = state.containers

  modalActive = ko.observable(false)

  modalContainer = ko.observable<ContainerInfo>({
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

  showModal = (container: ContainerInfo) => {
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
