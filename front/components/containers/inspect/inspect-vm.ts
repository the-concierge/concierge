import * as ko from 'knockout'
import * as fs from 'fs'
import state, { ObservableContainer } from '../../state'
import menu from '../../menu'
import { activeContainer, activeContainerId } from '../common'
import stats from '../stats'
import '../logs'
import '../details'

class Inspect {
  containerId = ko.observable('')
  containerFullId = ko.observable('')

  container = activeContainer
  showStartButton = ko.computed(() => this.container().state() === 'exited')
  showStopButton = ko.computed(() => this.container().state() === 'running')
  containerWaiting = ko.observable(false)
  buttonLoading = ko.observable('')
  currentComponent = ko.observable('ko-container-details')

  constructor() {
    this.containerId.subscribe(id => {
      activeContainerId(id)
    })
  }

  viewDetails = () => this.currentComponent('ko-container-details')
  viewLogs = () => this.currentComponent('ko-container-logs')
  viewStats = () => {
    stats.getStats()
    this.currentComponent('ko-container-stats')
  }

  inspect = (container: ObservableContainer) => {
    this.viewDetails()
    this.containerId(container.id())
    this.containerFullId(container.fullId())
    this.resetButtons()
    this.refreshStatistics()
  }

  refreshStatistics = () => stats.getStats()

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

  stopContainer = () => this.modifyContainer('stop')
  startContainer = () => this.modifyContainer('start')
  removeContainer = () => this.modifyContainer('host', 'DELETE')
    .then(() => {
      // Disable all container buttons, but remain in the view
      this.containerWaiting(true)
    })
}

const viewModel = new Inspect()

menu.register(
  {
    path: '/containers/:id/inspect',
    item: { component: 'ko-inspect-container', name: 'Inspect Container', hide: true },
    run: (_, id) => {
      viewModel.containerId(id)
      stats.getStats()
    }
  }
)

ko.components.register('ko-inspect-container', {
  template: fs.readFileSync(`${__dirname}/inspect.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel