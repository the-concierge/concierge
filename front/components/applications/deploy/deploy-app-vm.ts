import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'

class Deploy {
  modalActive = ko.observable(false)

  imageTag = ko.observable('')
  refType = ko.observable('branch')

  selectedBranch = ko.observable({ type: 'branch', ref: '', sha: '' })
  selectedTag = ko.observable({ type: 'tag', ref: '', sha: '' })
  selectedRef = ko.computed(() => {
    return this.refType() === 'branch'
      ? this.selectedBranch()
      : this.selectedTag()
  })

  modalLoading = ko.observable(false)
  deployingApplication = ko.observable<Partial<Concierge.Application>>({ id: 0, name: '' })
  deployableRefs = ko.observableArray<{ type: string, ref: string, sha: string }>([])
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

  hideModal = () => {
    this.modalActive(false)
  }

  showModal = async (app: Concierge.Application) => {
    this.modalLoading(true)
    this.modalActive(true)
    this.deployingApplication(app)
    this.imageTag('')
    this.refType('branch')

    const refs = await fetch(`/api/applications/${app.id}/refs`).then(res => res.json())

    this.deployableRefs(refs)
    const firstBranch = this.deployableTags()[0]
    if (firstBranch) { this.selectedBranch(firstBranch) }

    const firstTag = this.deployableTags()[0]
    if (firstTag) { this.selectedTag(firstTag) }

    this.modalLoading(false)
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
    this.hideModal()

    const result = await fetch(url, { method: 'PUT' })
    const msg = await result.json()
    const success = result.status < 400

    if (success) {
      state.toast.success(msg.message)
      return
    }

    state.toast.error(`Failed to start deployment: ${msg.message}`)
  }
}

const viewModel = new Deploy()

ko.components.register('ko-deploy-application', {
  template: fs.readFileSync(`${__dirname}/deploy-app.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel