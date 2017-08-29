import * as ko from 'knockout'
import * as fs from 'fs'
import createApp from './create'
import editApp from './edit'
import deployApp from './deploy'
import appLogs from './logs'
import state from '../state'
import menu from '../menu'

class Applications {
  applications = state.applications

  showCreateModal = createApp.showModal
  showDeployModal = deployApp.showModal
  showLogsModal = appLogs.showModal
  showEditModal = editApp.editApplication

  refresh = () => state.getApplications()

  removeApplication = async (app: Concierge.Application) => {
    await fetch(`/api/applications/${app.id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => state.toast.primary(res.message))

    this.refresh()
  }
}

const applications = new Applications()

ko.components.register('ko-applications', {
  template: fs.readFileSync(`${__dirname}/applications.html`).toString(),
  viewModel: {
    createViewModel: () => applications
  }
})

menu.register(
  {
    path: '/applications',
    item: { component: 'ko-applications', name: 'Applications' }
  }
)