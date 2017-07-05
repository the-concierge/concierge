import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Applications {
  applications = state.applications

  name = ko.observable('')
  repository = ko.observable('')
  key = ko.observable('')
  label = ko.observable('')

  imageTag = ko.observable('')
  refType = ko.observable('branch')

  selectedBranch = ko.observable({ type: 'branch', ref: '' })
  selectedTag = ko.observable({ type: 'tag', ref: '' })
  selectedRef = ko.computed(() => {
    return this.refType() === 'branch'
      ? this.selectedBranch()
      : this.selectedTag()
  })

  createModalActive = ko.observable(false)
  deployModalActive = ko.observable(false)
  deployModalLoading = ko.observable(false)
  deployingApplication = ko.observable<Partial<Concierge.Application>>({ id: 0, name: '' })
  deployableRefs = ko.observableArray<{ type: string, ref: string }>([])
  deployableBranches = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'branch'))
  deployableTags = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'tag'))

  computedImageTag = ko.computed(() => {
    const setTag = this.imageTag()
    if (setTag) {
      return setTag
    }

    const ref = (this.selectedRef() || { ref: '' }).ref
    if (ref.length > 0) {
      return ref.toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-\.]+/g, '')       // Remove all non-word chars except dashes and dots
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')            // Trim - from end of text
    }

    return 'latest'
  })
  finalImageTag = ko.computed(() => `${this.deployingApplication().label}:${this.computedImageTag()}`)

  hideCreateModal = () => this.createModalActive(false)
  hideDeployModal = () => this.deployModalActive(false)

  refresh = () => state.getApplications()

  showCreateModal = () => {
    this.repository('')
    this.name('')
    this.key('')
    this.label('')
    this.createModalActive(true)
  }

  showDeployModal = async (app: Concierge.Application) => {
    this.deployModalLoading(true)
    this.deployModalActive(true)
    this.deployingApplication(app)
    this.imageTag('')
    this.refType('branch')

    const refs = await fetch(`/api/applications/${app.id}/refs`).then(res => res.json())

    this.deployableRefs(refs)
    const firstBranch = this.deployableTags()[0]
    if (firstBranch) { this.selectedBranch(firstBranch) }

    const firstTag = this.deployableTags()[0]
    if (firstTag) { this.selectedTag(firstTag) }

    this.deployModalLoading(false)
  }

  createApplication = async () => {
    const repository = this.repository()
    const name = this.name()
    const key = this.key()
    const label = this.label()

    const result = await fetch(`/api/applications?name=${name}&repository=${repository}&key=${key}&label=${label}`, {
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