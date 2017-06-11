import * as ko from 'knockout'
class StateManager {
  containers = ko.observableArray<Concierge.APIContainer>([])
  hosts = ko.observableArray<Concierge.APIHost>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])

  getContainers = () => fetch('/containers')
    .then(res => res.json())
    .then(containers => {
      this.containers.destroyAll()
      this.containers.push(...containers)
    })
}

const state = new StateManager()

export default state