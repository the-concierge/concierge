import * as ko from 'knockout'
import * as fs from 'fs'
import createApp from './create'
import editApp from './edit'
import deployApp from './deploy'
import appLogs from './logs'
import state, { Image } from '../state'
import menu from '../menu'
import images from '../images/images-vm'

// TODO: Better solution for isomorphic code
// Retrieve from API?
import { State } from '../../../src/api/applications/types'

interface ApplicationVM extends Concierge.ApplicationDTO {
  displayImages: KnockoutObservable<boolean>
  images: KnockoutComputed<Image[]>
  remotes: KnockoutComputed<Concierge.ApplicationRemote[]>
}

class Applications {
  applications = ko.observableArray<ApplicationVM>([])

  constructor() {
    state.applications.subscribe(newApps => {
      const apps = this.applications()
      for (const newApp of newApps) {
        const existing = apps.find(app => app.id === newApp.id)
        if (existing) {
          continue
        }

        const appImages = ko.computed(() =>
          state.images().filter(image => image.name.indexOf(newApp.label) === 0)
        )

        const appRemotes = ko.computed(() =>
          state
            .applicationRemotes()
            .filter(remote => remote.applicationId === newApp.id && remote.state !== 4)
        )

        this.applications.push({
          ...newApp,
          displayImages: ko.observable(false),
          images: appImages,
          remotes: appRemotes
        })
      }
    })
  }

  showCreateModal = createApp.showModal
  showDeployModal = deployApp.showModal
  showLogsModal = appLogs.showModal
  showEditModal = editApp.editApplication

  refresh = () => state.getApplications()
  toMb = images.toMb
  toDate = images.toDate
  runImage = images.runImage
  removeImage = images.removeImage

  toStatus = (state: number) => State[state]

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
