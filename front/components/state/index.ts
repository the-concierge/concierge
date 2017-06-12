import * as ko from 'knockout'
import { ContainerInfo } from 'dockerode'

class StateManager {
  containers = ko.observableArray<ContainerInfo>([])
  hosts = ko.observableArray<Concierge.APIHost>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])

  constructor() {
    this.getContainers()
    this.getHosts()
  }

  getContainers = () =>
    fetch('/v2/hosts/containers')
      .then(res => res.json())
      .then(containers => {
        this.containers.destroyAll()
        this.containers.push(...containers)
      })

  getHosts = () => {
    fetch('/v2/hosts')
      .then(res => res.json())
      .then(hosts => {
        this.hosts.destroyAll()
        this.hosts.push(...hosts)
      })
  }
}

const state = new StateManager()

export default state
