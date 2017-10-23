import * as ko from 'knockout'
import { Image, Container, ObservableContainer, State, ApplicationRemoteDTO } from './types'
import updateContainer from './update'
import socket from './socket'
import Monitor from './monitor'

export { Image, Container, ObservableContainer, State }

class StateManager {
  images = ko.observableArray<Image>([])
  containers = ko.observableArray<ObservableContainer>([])
  hosts = ko.observableArray<Concierge.Host>([])
  registries = ko.observableArray<Concierge.Registry>([])
  applications = ko.observableArray<Concierge.ApplicationDTO>([])
  applicationRemotes = ko.observableArray<ApplicationRemoteDTO>([])
  configuration = ko.observable<Partial<Concierge.Configuration>>({})
  credentials = ko.observableArray<Concierge.Credentials>([])
  monitors = ko.observableArray<Monitor<string>>([])

  toasts = ko.observableArray<{ msg: string; cls: string; remove: () => void }>([])
  toast = {
    primary: (msg: string) => this.showToast('toast-primary', msg),
    error: (msg: string) => this.showToast('toast-error', msg),
    warn: (msg: string) => this.showToast('toast-warning', msg),
    success: (msg: string) => this.showToast('toast-success', msg)
  }

  constructor() {
    this.getContainers()
    this.getHosts()
    this.getImages()
    this.getApplications()
    this.getApplicationRemotes()
    this.getConfiguration()
    this.getCredentials()

    setInterval(() => {
      this.getContainers()
      this.getImages()
    }, 5000)

    socket.on('stats', (event: ConciergeEvent<ContainerEvent>) => {
      const container = this.containers().find(container => event.name.startsWith(container.id()))
      if (!container) {
        return
      }

      updateContainer(container, event)
    })

    socket.on('build-status', (event: ConciergeEvent<BuildStatusEvent>) => {
      const remotes = this.applicationRemotes()
      const branch = event.event
      const existing = remotes.find(
        remote => remote.applicationId === branch.applicationId && remote.remote === branch.remote
      )

      if (existing) {
        this.applicationRemotes.replace(existing, {
          ...existing,
          imageId: branch.imageId || existing.imageId,
          sha: branch.sha,
          state: branch.state
        })
        return
      }

      this.applicationRemotes.push({
        id: 0,
        ...branch,
        imageId: branch.imageId || '',
        image: this.getRemoteImage(branch.imageId)
      })
    })
  }

  showToast = (cls: string, msg: string, duration: number = 5000) => {
    const toast = { msg, cls, remove: () => this.toasts.remove(toast) }
    this.toasts.push(toast)
    setTimeout(toast.remove, duration)
  }

  monitor = (event: string, name: string) => {
    const monitors = this.monitors()
    const match = monitors.find(mon => mon.event === event && mon.name === name)
    if (match) {
      return
    }
    this.monitors.push(new Monitor<string>(event, name))
  }

  getContainers = async () => {
    const containers: Container[] = await fetch('/api/hosts/containers').then(res => res.json())

    const seenContainers: string[] = []
    const stateContainers = this.containers()
    containers.forEach(container => {
      seenContainers.push(container.Id)
      const existing = stateContainers.find(c => container.Id.startsWith(c.id()))
      if (existing) {
        existing.state(container.State)
        existing.status(container.Status)

        const ports = portsToUrls(container)

        for (const port of ports) {
          const existingPort = existing.ports().find(ep => ep.private === port.private)
          if (!existingPort) {
            existing.ports.push(port)
            continue
          }

          if (existingPort.url !== port.url) {
            existing.ports.remove(existingPort)
            existing.ports.push(port)
          }
        }
        return
      }

      const newContainer = toObservableContainer(container)
      this.containers.push(newContainer)
    })

    // Remove every unseen container as it's probably been deleted
    this.containers.remove(c => {
      const wasSeen = seenContainers.some(seenId => seenId.startsWith(c.id()))
      return !wasSeen
    })
  }

  getHosts = () => {
    fetch('/api/hosts')
      .then(res => res.json())
      .then(hosts => {
        this.hosts.removeAll()
        this.hosts.push(...hosts)
      })
  }

  getImages = () => {
    fetch('/api/images')
      .then(res => res.json())
      .then(images => {
        for (const image of images) {
          const name = getTag(image.RepoTags || [])
          if (!name) {
            continue
          }
          image.name = name
          const existing = this.images().find(existing => existing.name === name)
          if (existing) {
            // Take no action if we already have the image and the Id has not changed
            if (existing.Id === image.Id) {
              continue
            }

            // Remove an existing image if it has a new Id
            // I.e. The image has been replaced with a new build
            this.images.replace(existing, image)
            continue
          }

          this.images.push(image)
        }
      })
  }

  getApplications = () => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(apps => {
        for (const app of apps) {
          const existing = this.applications().find(ex => app.id === ex.id)
          if (!existing) {
            this.applications.push(app)
            continue
          }

          this.applications.replace(existing, app)
        }
      })
  }

  getApplicationRemotes = () => {
    const url = '/api/applications/branches?active'

    fetch(url)
      .then(res => res.json())
      .then((remotes: Concierge.ApplicationRemote[]) => {
        const existingRemotes = this.applicationRemotes()
        const find = (id: number) => existingRemotes.find(rem => rem.id === id)

        for (const remote of remotes) {
          remote.imageId = remote.imageId || ''
          const existing = find(remote.id)
          if (!existing) {
            const newRemote: ApplicationRemoteDTO = {
              ...remote,
              imageId: remote.imageId || '',
              image: this.getRemoteImage(remote.imageId)
            }
            this.applicationRemotes.push(newRemote)
            continue
          }

          this.applicationRemotes.replace(existing, {
            ...remote,
            imageId: remote.imageId || '',
            image: this.getRemoteImage(remote.imageId)
          })
        }
      })
  }

  getCredentials = () => {
    fetch('/api/credentials')
      .then(res => res.json())
      .then(creds => {
        this.credentials.destroyAll()
        this.credentials.push(...creds)
      })
  }

  getConfiguration = () => {
    fetch('/api/configuration')
      .then(res => res.json())
      .then(cfg => this.configuration(cfg))
  }

  getRemoteImage = (imageId?: string) => {
    return ko.computed(
      () => (imageId ? this.images().find(image => image.Id === imageId) : undefined)
    )
  }
}

function getTag(tags: string[]) {
  const tag = tags.find(tag => tag !== '<none>:<none>')
  return tag
}

const state = new StateManager()

export default state

function toObservableContainer(container: Container) {
  const ports = portsToUrls(container)

  const newContainer: ObservableContainer = {
    id: ko.observable(container.Id.slice(0, 10)),
    fullId: ko.observable(container.Id),
    image: ko.observable(container.Image),
    name: ko.observable((container.Names[0] || '').slice(1)),
    restart: ko.observable(''),
    state: ko.observable(container.State),
    status: ko.observable(container.Status),
    stats: {
      mbIn: ko.observable('...'),
      mbOut: ko.observable('...'),
      cpu: ko.observable('...'),
      memory: ko.observable('...')
    },
    host: container.concierge.host,
    ports: ko.observableArray(ports)
  }

  return newContainer
}

function portsToUrls(container: Container) {
  const ports = container.Ports
  const hostname = container.concierge.host.vanityHostname || container.concierge.host.hostname
  return ports
    .filter(port => port.Type === 'tcp')
    .filter(port => port.hasOwnProperty('PublicPort'))
    .map(port => ({ url: `http://${hostname}:${port.PublicPort}`, private: port.PrivatePort }))
}
