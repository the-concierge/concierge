import * as ko from 'knockout'
import * as fs from 'fs'
import state, { Image } from '../state'
import { common } from 'analysis'
import { ImageInspectInfo } from 'dockerode'

type NewContainer = {
  name: KnockoutObservable<string>,
  envs: KnockoutObservableArray<{ key: string, value: KnockoutObservable<string> }>
  ports: KnockoutObservableArray<{ port: number, type: string, expose: KnockoutObservable<boolean> }>
  volumes: KnockoutObservableArray<{ path: string, hostPath: KnockoutObservable<string> }>
  links: KnockoutObservableArray<{ containerName: string, alias: KnockoutObservable<string> }>
}

type ContainerLink = {
  containerName: string
  alias: KnockoutObservable<string>
}

class Images {
  modalActive = ko.observable(false)
  creatingContainer = ko.observable(false)
  modalImage = ko.observable<Partial<Image>>({
    name: '...'
  })

  newContainer: NewContainer = {
    name: ko.observable(''),
    envs: ko.observableArray([]),
    ports: ko.observableArray([]),
    volumes: ko.observableArray([]),
    links: ko.observableArray([])
  }

  canRunContainer = ko.computed(() => {
    const container = this.newContainer

    const isCreatingContainer = this.creatingContainer()
    const allLinksAliases = container
      .links()
      .every(link => link.alias() !== '')

    return allLinksAliases && !isCreatingContainer
  })

  images = state.images
  imageFilter = ko.observable('')

  filteredImages = ko.computed(() => {
    const filter = this.imageFilter()
    const images = this.images()
    if (!filter) {
      return images
    }

    return images.filter(image => image.name.indexOf(filter) > -1)
  })

  selectedContainerLink = ko.observable({
    name: '',
    image: '',
    label: ''
  })

  linkableContainers = ko.observableArray([])

  addContainerLink = () => {
    const container = this.selectedContainerLink()
    this.newContainer.links.push({
      containerName: container.name,
      alias: ko.observable('')
    })

    this.refreshLinkableContainers()
  }

  removeContainerLink = (link: ContainerLink) => {
    this.newContainer.links.remove(container => container.containerName === link.containerName)
    this.refreshLinkableContainers()
  }

  toMb = (size: number) => `${common.round(size / 1024 / 1024, 2)}MB`
  toDate = (timestamp: number) => new Date(timestamp * 1000).toUTCString()

  hideModal = () => this.modalActive(false)
  showModal = () => this.modalActive(true)

  clearFilter = () => this.imageFilter('')
  refresh = () => state.getImages()

  removeImage = async (image: Image) => {
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

  getLinkableContainers = () => {
    const links = this.newContainer.links()
    return state
      .containers()
      .filter(container => {
        const name = container.Names[0].slice(1)
        const isRunning = container.State === 'running'
        const isNotLinked = links.every(link => link.containerName !== name)
        return isRunning && isNotLinked
      })
      .map(container => ({
        name: container.Names[0].slice(1),
        image: container.Image,
        label: `[${container.Image.slice(0, 20)}] ${container.Names[0].slice(1)}`
      }))
  }

  refreshLinkableContainers = () => {
    this.linkableContainers.destroyAll()
    this.linkableContainers.push(...this.getLinkableContainers())
  }

  configureImage = async (image: Image) => {
    this.modalImage(image)
    this.modalActive(true)

    // Reset existing values
    this.newContainer.name('')
    this.newContainer.ports.removeAll()
    this.newContainer.envs.removeAll()
    this.newContainer.volumes.removeAll()
    this.newContainer.links.removeAll()

    const info: ImageInspectInfo = await fetch(`/api/images/${image.Id}/inspect/${image.concierge.hostId}`)
      .then(res => res.json())

    const ports = getPorts(info)
    const envs = getEnvs(info)
    const volumes = getVolumes(info)

    this.newContainer.ports.push(...ports)
    this.newContainer.envs.push(...envs)
    this.newContainer.volumes.push(...volumes)
    this.refreshLinkableContainers()
  }

  runContainer = async () => {
    const image = this.modalImage()
    const container = this.newContainer

    const name = container.name()

    const envs = container.envs()
      .map(({ key, value }) => ({
        key,
        value: value()
      }))

    const ports = container.ports()
      .map(({ port, expose, type }) => ({
        port,
        type,
        expose: expose()
      }))

    const volumes = container.volumes()
      .map(({ path, hostPath }) => ({
        path,
        hostPath: hostPath()
      }))

    const links = container.links().map(link => ({
      containerName: link.containerName,
      alias: link.alias()
    }))

    const newContainer = {
      name,
      image: image.name,
      ports,
      envs,
      volumes,
      links
    }

    this.creatingContainer(true)
    const result = await fetch(`/api/images/run`, {
      body: JSON.stringify(newContainer),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.creatingContainer(false)
    this.hideModal()

    if (result.status < 400) {
      state.toast.success(`Successfully created container`)
      return
    }

    const msg = await result.json()
    state.toast.error(`Failed to create container: ${msg.message}`)
  }
}

const images = new Images()

ko.components.register('ko-images', {
  template: fs.readFileSync(`${__dirname}/images.html`).toString(),
  viewModel: {
    createViewModel: () => images
  }
})

function getPorts(info: ImageInspectInfo) {
  if (!info.Config.ExposedPorts) {
    return []
  }

  const ports = Object.keys(info.Config.ExposedPorts)
    .map(port => {
      const split = port.split('/')
      return { port: split[0], type: split[1] }
    })
    .map(port => ({ port: Number(port.port), type: port.type, expose: ko.observable(false) }))

  return ports
}

function getEnvs(info: ImageInspectInfo) {
  const envs = info.Config.Env
    .map(env => {
      const split = env.split('=')
      const pair = { key: split[0], value: ko.observable(split.slice(1).join('=')) }
      return pair
    })

  return envs
}

function getVolumes(info: ImageInspectInfo) {
  if (!info.Config.Volumes) {
    return []
  }

  const volumes = Object.keys(info.Config.Volumes)
    .map(path => ({ path, hostPath: ko.observable('') }))

  return volumes
}