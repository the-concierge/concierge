import * as ko from 'knockout'

class StateManager {
  containers = ko.observableArray<Concierge.APIContainer>([])
  hosts = ko.observableArray<Concierge.APIHost>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])

  constructor() {
    this.getContainers()
  }

  getContainers = () =>
    fetch('/api/container/running').then(res => res.json()).then(containers => {
      this.containers.destroyAll()
      this.containers.push(...containers)
    })
}

const state = new StateManager()

export default state
