import * as ko from 'knockout'
class StateManager {
  containers = ko.observableArray<Concierge.APIContainer>([])
  hosts = ko.observableArray<Concierge.APIHost>([])
  concierges = ko.observableArray<Concierge.Concierge>([])
  registries = ko.observableArray<Concierge.Registry>([])
}

const state = new StateManager()

export default state