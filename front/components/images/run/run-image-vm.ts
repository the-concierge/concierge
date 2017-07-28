import * as ko from 'knockout'
import * as fs from 'fs'
import state, { Image } from '../../state'
import { ImageInspectInfo } from 'dockerode'

type ContainerLink = {
  containerName: string
  alias: KnockoutObservable<string>
}

type NewContainer = {
  name: KnockoutObservable<string>,
  customEnvs: KnockoutObservableArray<{ key: string, value: KnockoutObservable<string> }>
  envs: KnockoutObservableArray<{ key: string, value: KnockoutObservable<string> }>
  ports: KnockoutObservableArray<{ port: number, type: string, expose: KnockoutObservable<boolean>, hostPort: KnockoutObservable<string> }>
  volumes: KnockoutObservableArray<{ path: string, hostPath: KnockoutObservable<string> }>
  links: KnockoutObservableArray<{ containerName: string, alias: KnockoutObservable<string> }>
}

class Run {
  modalActive = ko.observable(false)

  newCustomVariableName = ko.observable('')
  newContainer: NewContainer = {
    name: ko.observable(''),
    customEnvs: ko.observableArray([]),
    envs: ko.observableArray([]),
    ports: ko.observableArray([]),
    volumes: ko.observableArray([]),
    links: ko.observableArray([])
  }

  creatingContainer = ko.observable(false)
  modalImage = ko.observable<Partial<Image>>({
    name: '...'
  })

  canRunContainer = ko.computed(() => {
    const container = this.newContainer

    const isCreatingContainer = this.creatingContainer()
    const allLinksAliases = container
      .links()
      .every(link => link.alias() !== '')

    return allLinksAliases && !isCreatingContainer
  })

  selectedContainerLink = ko.observable({
    name: '',
    image: '',
    label: ''
  })

  linkableContainers = ko.observableArray([])

  hideModal = () => this.modalActive(false)
  showModal = () => this.modalActive(true)

  addCustomVariable = () => {
    const key = this.newCustomVariableName()
    if (!key) {
      return
    }

    this.newContainer.customEnvs.push({ key, value: ko.observable('') })
    this.newCustomVariableName('')
  }

  removeCustomVariable = (customEnv: { key: string }) => {
    this.newContainer.customEnvs.remove(env => env.key === customEnv.key)
  }

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

  getLinkableContainers = () => {
    const links = this.newContainer.links()
    return state
      .containers()
      .filter(container => {
        const name = container.name()
        const isRunning = container.state() === 'running'
        const isNotLinked = links.every(link => link.containerName !== name)
        return isRunning && isNotLinked
      })
      .map(container => ({
        name: container.name(),
        image: container.image(),
        label: `[${container.image().slice(0, 20)}] ${container.name()}`
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
    this.newContainer.customEnvs.removeAll()

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
      .concat(container.customEnvs())
      .map(({ key, value }) => ({
        key,
        value: value()
      }))

    const ports = container.ports()
      .map(({ port, expose, type, hostPort }) => ({
        port,
        type,
        hostPort: hostPort(),
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

const viewModel = new Run()

ko.components.register('ko-run-image', {
  template: fs.readFileSync(`${__dirname}/run-image.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel

function getPorts(info: ImageInspectInfo) {
  if (!info.Config.ExposedPorts) {
    return []
  }

  const ports = Object.keys(info.Config.ExposedPorts)
    .map(port => {
      const split = port.split('/')
      return { port: split[0], type: split[1] }
    })
    .map(port => ({ port: Number(port.port), type: port.type, expose: ko.observable(false), hostPort: ko.observable('') }))

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
