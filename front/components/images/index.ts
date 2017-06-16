import * as ko from 'knockout'
import * as fs from 'fs'
import state, { Image } from '../state'
import { common } from 'analysis'

class Images {
  modalActive = ko.observable(false)
  modalImage = ko.observable<Partial<Image>>({
    name: '...'
  })

  newContainer = {
    name: ko.observable('')
  }

  images = state.images

  toMb = (size: number) => `${common.round(size / 1024 / 1024, 2)}MB`
  toDate = (timestamp: number) => new Date(timestamp * 1000).toString()

  hideModal = () => this.modalActive(false)
  showModal = () => this.modalActive(true)

  runImage = (image: Image) => {
    this.modalImage(image)
    this.modalActive(true)

    // Reset existing values
    this.newContainer.name('')
  }

}

const images = new Images()

ko.components.register('ko-images', {
  template: fs.readFileSync(`${__dirname}/images.html`).toString(),
  viewModel: {
    createViewModel: () => images
  }
})