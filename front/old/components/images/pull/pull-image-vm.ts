import * as ko from 'knockout'
import state from '../../state'

class Run {
  modalActive = ko.observable(false)
  pullEnabled = ko.observable(true)

  imageName = ko.observable('')
  tag = ko.observable('')

  hideModal = () => this.modalActive(false)

  showModal = () => {
    this.imageName('')
    this.tag('')
    this.modalActive(true)
  }

  pullImage = async () => {
    const imageName = this.imageName()
    const tag = this.tag()

    if (!imageName) {
      state.toast.error(`Must specify image name and tag`)
      return
    }

    this.pullEnabled(false)
    const result = await fetch(`/api/images/pull?imageName=${imageName}&tag=${tag || 'latest'}`, {
      method: 'POST'
    })
    this.pullEnabled(true)

    if (result.status < 400) {
      state.toast.success('Successfully begun pulling image')
      this.hideModal()
      return
    }

    const msg = await result.json()
    state.toast.error(`Failed to pull image: ${msg.message}`)
  }
}

const viewModel = new Run()

ko.components.register('ko-pull-image', {
  template: require('./pull-image.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
