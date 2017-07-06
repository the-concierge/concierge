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
    volumes: ko.observableArray([])
  }

  images = state.images

  toMb = (size: number) => `${common.round(size / 1024 / 1024, 2)}MB`
  toDate = (timestamp: number) => new Date(timestamp * 1000).toUTCString()

  hideModal = () => this.modalActive(false)
  showModal = () => this.modalActive(true)

  refresh = () => state.getImages()

  configureImage = async (image: Image) => {
    this.modalImage(image)
    this.modalActive(true)

    // Reset existing values
    this.newContainer.name('')
    this.newContainer.ports.destroyAll()
    this.newContainer.envs.destroyAll()
    this.newContainer.volumes.destroyAll()

    const info: ImageInspectInfo = await fetch(`/api/images/${image.Id}/inspect/${image.concierge.hostId}`)
      .then(res => res.json())

    const ports = getPorts(info)
    const envs = getEnvs(info)
    const volumes = getVolumes(info)

    this.newContainer.ports.push(...ports)
    this.newContainer.envs.push(...envs)
    this.newContainer.volumes.push(...volumes)
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

    const newContainer = {
      name,
      image: image.name,
      ports,
      envs,
      volumes
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