import * as ko from 'knockout'
import * as fs from 'fs'
import createApp from './create'
import editApp from './edit'
import deployApp from './deploy'
import appLogs from './logs'
import state from '../state'
import menu from '../menu'
import images from '../images/images-vm'

class Applications {
  applications = ko.computed(() => {
    const apps = state.applications()
    const images = state.images()

    return apps.map(app => {
      const appImages = ko.computed(() =>
        images.filter(image => image.name.indexOf(app.label) === 0)
      )

      return { ...app, images: appImages, displayImages: ko.observable(false) }
    })
  })

  showCreateModal = createApp.showModal
  showDeployModal = deployApp.showModal
  showLogsModal = appLogs.showModal
  showEditModal = editApp.editApplication

  refresh = () => state.getApplications()
  toMb = images.toMb
  toDate = images.toDate
  runImage = images.runImage
  removeImage = images.removeImage

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

menu.register({
  path: '/applications',
  item: { component: 'ko-applications', name: 'Applications' },
  position: 20
})
