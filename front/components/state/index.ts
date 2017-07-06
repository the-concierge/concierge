import * as ko from 'knockout'
import { Image, Container, ConciergeEvent, Stats, ContainerEvent } from './types'
import updateContainer from './update'
import socket from './socket'
import Monitor from './monitor'

export {
  Image,
  Container,
}

class StateManager {
  images = ko.observableArray<Image>([])
  containers = ko.observableArray<Container>([])
  hosts = ko.observableArray<Concierge.Host>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])
  applications = ko.observableArray<Concierge.Application>([])
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

    setInterval(() => this.getContainers(), 5000)

    socket.on('stats', (event: ConciergeEvent<ContainerEvent>) => {
      const container = this.containers().find(container => container.Id === event.name)
      if (!container) {
        return
      }

      const newContainer = updateContainer(container, event)
      this.containers.replace(container, newContainer)
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

  getContainers = () =>
    fetch('/api/hosts/containers')
      .then(res => res.json())
      .then(containers => {
        const seenContainers: string[] = []
        const stateContainers = this.containers()
        containers.forEach(container => {
          seenContainers.push(container.Id)
          const existing = stateContainers.find(c => c.Id === container.Id)
          if (existing) {
            const newContainer = { ...existing }
            newContainer.State = container.State
            newContainer.Status = container.Status
            newContainer.stats = existing.stats
            this.containers.replace(existing, newContainer)
            return
          }

          const stats: Stats = {
            cpu: '...',
            memory: '...',
            mbIn: '...',
            mbOut: '...'
          }

          container.stats = stats
          this.containers.push(container)
        })

        // Remove every unseen container as it's probably been deleted
        this.containers.remove(c => seenContainers.every(s => s !== c.Id))
      })

  getHosts = () => {
    fetch('/api/hosts')
      .then(res => res.json())
      .then(hosts => {
        this.hosts.destroyAll()
        this.hosts.push(...hosts)
      })
  }

  getImages = () => {
    fetch('/api/images')
      .then(res => res.json())
      .then(images => {
        this.images.destroyAll()

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
}

function getTag(tags: string[]) {
  const tag = tags.find(tag => tag !== '<none>:<none>')
  return tag
}

const state = new StateManager()

export default state
