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

  selectedBranch = ko.observable({ type: 'branch', ref: '', sha: '' })
  selectedTag = ko.observable({ type: 'tag', ref: '', sha: '' })
  selectedRef = ko.computed(() => {
    return this.refType() === 'branch'
      ? this.selectedBranch()
      : this.selectedTag()
  })

  createModalActive = ko.observable(false)
  deployModalActive = ko.observable(false)
  logsModalActive = ko.observable(false)

  deployModalLoading = ko.observable(false)
  deployingApplication = ko.observable<Partial<Concierge.Application>>({ id: 0, name: '' })
  deployableRefs = ko.observableArray<{ type: string, ref: string, sha: string }>([])
  deployableBranches = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'branch'))
  deployableTags = ko.computed(() => this.deployableRefs().filter(ref => ref.type === 'tag'))

  buildLogs = ko.observableArray<{ url: string, name: string }>([])

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
  hideLogsModal = () => this.logsModalActive(false)

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

  showLogsModal = async (app: Concierge.Application) => {
    this.buildLogs.destroyAll()
    this.logsModalActive(true)
    const logs = await fetch(`/api/applications/${app.id}/logs`).then(r => r.json()) as string[]
    const buildLogs = logs.map(log => ({
      name: log,
      url: `/api/applications/${app.id}/logs/${log}`
    }))

    this.buildLogs.push(...buildLogs)
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

  deployApplication = async () => {
    const app = this.deployingApplication()
    const id = app.id
    const ref = this.selectedRef()
    const tag = this.finalImageTag()
    const sha = ref.sha
    const url = `/api/applications/${id}/deploy?ref=${ref.ref}&tag=${tag}&type=${ref.type}&sha=${sha}`

    state.monitor('build', `${id}/${tag}`)
    state.toast.primary(`Attempting to deploy application...`)
    this.hideDeployModal()

    const result = await fetch(url, { method: 'PUT' })
    const msg = await result.json()
    const success = result.status < 400

    if (success) {
      state.toast.success(msg.message)
      return
    }

    state.toast.error(`Failed to start deployment: ${msg.message}`)
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