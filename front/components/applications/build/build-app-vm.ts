import * as ko from 'knockout'
import state from '../../state'

class Build {
  modalActive = ko.observable(false)

  imageTag = ko.observable('')
  refType = ko.observable('branch')

  selectedBranch = ko.observable({ type: 'branch', ref: '', sha: '' })
  selectedTag = ko.observable({ type: 'tag', ref: '', sha: '' })
  selectedRef = ko.computed(() => {
    return this.refType() === 'branch' ? this.selectedBranch() : this.selectedTag()
  })

  modalLoading = ko.observable(false)
  buildingApplication = ko.observable<Partial<Concierge.Application>>({ id: 0, name: '' })
  buildableRefs = ko.observableArray<{ type: string; ref: string; sha: string }>([])
  buildableBranches = ko.computed(() => this.buildableRefs().filter(ref => ref.type === 'branch'))
  buildableTags = ko.computed(() => this.buildableRefs().filter(ref => ref.type === 'tag'))

  computedImageTag = ko.computed(() => {
    const setTag = this.imageTag()
    if (setTag) {
      return setTag
    }

    const ref = (this.selectedRef() || { ref: '' }).ref
    if (ref.length > 0) {
      return ref
    }

    return 'latest'
  })

  toSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-\.]+/g, '') // Remove all non-word chars except dashes and dots
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  toImageTag = (appLabel: string, ref: string) => `${appLabel}:${this.toSlug(ref || 'latest')}`

  finalImageTag = ko.computed(() =>
    this.toImageTag(this.buildingApplication().label || '', this.computedImageTag())
  )

  hideModal = () => {
    this.modalActive(false)
  }

  showModal = async (app: Concierge.Application) => {
    this.modalLoading(true)
    this.modalActive(true)
    this.buildingApplication(app)
    this.imageTag('')
    this.refType('branch')

    const refs = await fetch(`/api/applications/${app.id}/refs`).then(res => res.json())

    this.buildableRefs(refs)
    const firstBranch = this.buildableTags()[0]
    if (firstBranch) {
      this.selectedBranch(firstBranch)
    }

    const firstTag = this.buildableTags()[0]
    if (firstTag) {
      this.selectedTag(firstTag)
    }

    this.modalLoading(false)
  }

  buildApplication = async () => {
    const app = this.buildingApplication()
    const id = app.id
    const ref = this.selectedRef()
    const tag = this.finalImageTag()
    const sha = ref.sha
    const url = `/api/applications/${id}/build?ref=${ref.ref}&tag=${tag}&type=${ref.type}&sha=${sha}`

    state.toast.primary(`Attempting to queue application build...`)
    this.hideModal()

    const result = await fetch(url, { method: 'PUT' })
    const msg = await result.json()
    const success = result.status < 400

    if (success) {
      state.toast.success(msg.message)
      return
    }

    state.toast.error(`Failed to queue build: ${msg.message}`)
  }
}

const viewModel = new Build()

ko.components.register('ko-build-application', {
  template: require('./build-app.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
