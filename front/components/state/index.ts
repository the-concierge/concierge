import * as ko from 'knockout'
import { Image, Container, ConciergeEvent, ContainerEvent, ObservableContainer } from './types'
import updateContainer from './update'
import socket from './socket'
import Monitor from './monitor'

export {
  Image,
  Container,
  ObservableContainer
}

class StateManager {
  images = ko.observableArray<Image>([])
  containers = ko.observableArray<ObservableContainer>([])
  hosts = ko.observableArray<Concierge.Host>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])
  applications = ko.observableArray<Concierge.Application>([])
  configuration = ko.observable<Partial<Concierge.Configuration>>({})
  monitors = ko.observableArray<Monitor<string>>([])

  toasts = ko.observableArray<{ msg: string, cls: string, remove: () => void }>([])
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
    this.getConfiguration()

    setInterval(() => this.getContainers(), 5000)

    socket.on('stats', (event: ConciergeEvent<ContainerEvent>) => {
      const container = this.containers().find(container => event.name.startsWith(container.id()))
      if (!container) {
        return
      }

      updateContainer(container, event)
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
    const containers: Container[] = await fetch('/api/hosts/containers')
      .then(res => res.json())

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
    this.containers.remove(c => seenContainers.every(seen => seen.startsWith(c.id())))
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
        this.images.removeAll()

        for (const image of images) {
          image.name = getTag(image.RepoTags || [])
        }

        this.images.push(...images.filter(image => image.name !== undefined))
      })
  }

  getApplications = () => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(applications => {
        this.applications.destroyAll()
        this.applications.push(...applications)
      })
  }

  getConfiguration = () => {
    fetch('/api/configuration')
      .then(res => res.json())
      .then(cfg => this.configuration(cfg))
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
    image: ko.observable(container.Image),
    name: ko.observable((container.Names[0] || '').slice(1)),
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

declare const _container: Container
type Ports = typeof _container.Ports

function portsToUrls(container: Container) {
  const ports = container.Ports
  const hostname = container.concierge.host.vanityHostname || container.concierge.host.hostname
  return ports.filter(port => port.Type === 'tcp')
    .filter(port => port.hasOwnProperty('PublicPort'))
    .map(port => ({ url: `http://${hostname}:${port.PublicPort}`, private: port.PrivatePort }))
}