import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Applications {
  applications = state.applications

  name = ko.observable('')
  repository = ko.observable('')
  key = ko.observable('')

  refType = ko.observable('branch')
  selectedRef = ko.observable('')

  createModalActive = ko.observable(false)
  deployModalActive = ko.observable(false)
  deployModalLoading = ko.observable(false)
  deployingApplication = ko.observable<Partial<Concierge.Application>>({ id: 0, name: '' })
  deployableRefs = ko.observableArray<{ type: string, ref: string }>([])
  deployableBranches = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'branch'))
  deployableTags = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'tag'))

  hideCreateModal = () => this.createModalActive(false)
  hideDeployModal = () => this.deployModalActive(false)

  refresh = () => state.getApplications()

  showCreateModal = () => {
    this.repository('')
    this.name('')
    this.key('')
    this.createModalActive(true)
  }

  showDeployModal = async (app: Concierge.Application) => {
    this.deployModalLoading(true)
    this.deployModalActive(true)
    this.deployingApplication(app)
    this.refType('branch')

    const refs = await fetch(`/api/applications/${app.id}/refs`).then(res => res.json())

    this.deployableRefs(refs)
    this.deployModalLoading(false)
  }

  createApplication = async () => {
    const repository = this.repository()
    const name = this.name()
    const key = this.key()

    const result = await fetch(`/api/applications?name=${name}&repository=${repository}&key=${key}`, {
      method: 'POST'
    })

    if (result.status === 200) {
      this.refresh()
      state.toast.success('Successfully created application')
      this.hideCreateModal()
      return
    }
    const error = await result.json()
    state.toast.error(`Failed to create application: ${error.message}`)
  }

  deployApplication = () => {
  }

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