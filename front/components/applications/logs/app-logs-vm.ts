import * as ko from 'knockout'

class Logs {
  modalActive = ko.observable(false)

  buildLogs = ko.observableArray<{ url: string; name: string }>([])

  hideModal = () => {
    this.modalActive(false)
  }

  showModal = async (app: Concierge.Application) => {
    this.buildLogs.destroyAll()
    this.modalActive(true)
    const logs = (await fetch(`/api/applications/${app.id}/logs`).then(r => r.json())) as string[]
    const buildLogs = logs.map(log => ({
      name: log,
      url: `/api/applications/${app.id}/logs/${log}`
    }))

    this.buildLogs.push(...buildLogs)
  }
}

const viewModel = new Logs()

ko.components.register('ko-application-logs', {
  template: require('./app-logs.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
