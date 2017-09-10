import * as ko from 'knockout'
import * as fs from 'fs'
import state, { Image } from '../../state'
import { ImageInspectInfo } from 'dockerode'

type ContainerLink = {
  containerName: string
  alias: KnockoutObservable<string>
}

class Run {
  modalActive = ko.observable(false)

  newCustomVariableName = ko.observable('')
  newCustomVolume = ko.observable('')

  name = ko.observable('')
  ports = ko.observableArray<{ port: number, type: string, expose: KnockoutObservable<boolean>, hostPort: KnockoutObservable<string> }>([])
  links = ko.observableArray<{ containerName: string, alias: KnockoutObservable<string> }>([])

  envs = ko.observableArray<{ key: string, value: KnockoutObservable<string> }>([])
  customEnvs = ko.observableArray<{ key: string, value: KnockoutObservable<string> }>([])

  volumes = ko.observableArray<{ path: string, hostPath: KnockoutObservable<string> }>([])
  customVolumes = ko.observableArray<{ path: string, hostPath: KnockoutObservable<string> }>([])

  creatingContainer = ko.observable(false)
  modalImage = ko.observable<Partial<Image>>({
    name: '...'
  })

  canRunContainer = ko.computed(() => {
    const isCreatingContainer = this.creatingContainer()
    const allLinksAliases = this
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

  addCustomVolume = () => {
    const key = this.newCustomVolume()
    if (!key) {
      return
    }

    this.customVolumes.push({ path: key, hostPath: ko.observable('') })
    this.newCustomVolume('')
  }

  removeCustomVolume = (customVolume: { path: string }) => {
    this.customVolumes.remove(env => env.path === customVolume.path)
  }

  copyPort = (locals: { port: string, hostPort: KnockoutObservable<string> }) => {
    locals.hostPort(locals.port)
  }

  addCustomVariable = () => {
    const key = this.newCustomVariableName()
    if (!key) {
      return
    }

    this.customEnvs.push({ key, value: ko.observable('') })
    this.newCustomVariableName('')
  }

  removeCustomVariable = (customEnv: { key: string }) => {
    this.customEnvs.remove(env => env.key === customEnv.key)
  }

  addContainerLink = () => {
    const container = this.selectedContainerLink()
    this.links.push({
      containerName: container.name,
      alias: ko.observable('')
    })

    this.refreshLinkableContainers()
  }

  removeContainerLink = (link: ContainerLink) => {
    this.links.remove(container => container.containerName === link.containerName)
    this.refreshLinkableContainers()
  }

  getLinkableContainers = () => {
    const links = this.links()
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
    this.newCustomVariableName('')
    this.newCustomVolume('')
    this.ports.removeAll()
    this.envs.removeAll()
    this.volumes.removeAll()
    this.name('')
    this.links.removeAll()
    this.customVolumes.removeAll()
    this.customEnvs.removeAll()

    const info: ImageInspectInfo = await fetch(`/api/images/${image.Id}/inspect/${image.concierge.hostId}`)
      .then(res => res.json())

    const ports = getPorts(info)
    const envs = getEnvs(info)
    const volumes = getVolumes(info)

    this.ports.push(...ports)
    this.envs.push(...envs)
    this.volumes.push(...volumes)
    this.refreshLinkableContainers()
  }

  runContainer = async () => {
    const image = this.modalImage()

    const name = this.name()

    const envs = this.envs()
      .concat(this.customEnvs())
      .map(({ key, value }) => ({
        key,
        value: value()
      }))

    const ports = this.ports()
      .map(({ port, expose, type, hostPort }) => ({
        port,
        type,
        hostPort: hostPort(),
        expose: expose()
      }))

    const volumes = this.volumes()
      .concat(this.customVolumes())
      .map(({ path, hostPath }) => ({
        path,
        hostPath: hostPath()
      }))

    const links = this.links().map(link => ({
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
