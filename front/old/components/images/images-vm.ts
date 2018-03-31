import * as ko from 'knockout'
import runImage from './run'
import pullImage from './pull'
import { common } from 'analysis'
import state, { Image } from '../state'
import menu from '../menu'

class Images {
  runImage = runImage.configureImage
  pullImage = pullImage.showModal

  images = state.images
  imageFilter = ko.observable('')

  filteredImages = ko.computed(() => {
    const filter = this.imageFilter()
    const images = this.images()
    const remotes = state.applicationRemotes()

    return images
      .filter(image => (filter ? image.name.indexOf(filter) > -1 : true))
      .filter(image => {
        const isRemoteImage = remotes.some(
          remote => !!remote.imageId && image.Id.indexOf(remote.imageId) === 0
        )
        return !isRemoteImage
      })
  })

  toMb = (size: number) => `${common.round(size / 1024 / 1024, 2)}MB`
  toDate = (timestamp: number) => new Date(timestamp * 1000).toUTCString()

  clearFilter = () => this.imageFilter('')
  refresh = () => state.getImages()

  removeImage = async (removeImage: Image | KnockoutComputed<Image>) => {
    const image: Image = ko.unwrap(removeImage)
    const tag = image.name
    const result = await fetch(`/api/images?tag=${tag}`, {
      method: 'DELETE'
    })

    const msg = await result.json()

    if (result.status < 400) {
      state.toast.success(msg.message)
      this.refresh()
      return
    }

    state.toast.error(msg.message)
    this.refresh()
  }
}

const images = new Images()
export default images

ko.components.register('ko-images', {
  template: require('./images.html'),
  viewModel: {
    createViewModel: () => images
  }
})

menu.register({
  path: '/images',
  item: { component: 'ko-images', name: 'Images' },
  position: 30
})
