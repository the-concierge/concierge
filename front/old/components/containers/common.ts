import * as ko from 'knockout'
import state, { ObservableContainer } from '../state'

export const defaultContainer: ObservableContainer = {
  id: ko.observable('...'),
  fullId: ko.observable('...'),
  name: ko.observable('...'),
  image: ko.observable('...'),
  state: ko.observable('...'),
  status: ko.observable('...'),
  restart: ko.observable(''),
  stats: {
    mbIn: ko.observable('...'),
    mbOut: ko.observable('...'),
    cpu: ko.observable('...'),
    memory: ko.observable('...')
  },
  ports: ko.observableArray([]),
  host: {
    capacity: 0,
    dockerPort: 0,
    hostname: '...',
    id: 0,
    vanityHostname: '...'
  }
}

export const activeContainer: KnockoutObservable<ObservableContainer> = ko.observable(
  defaultContainer
)
export const activeContainerId = ko.observable('')

activeContainerId.subscribe(id => {
  const container = state.containers().find(con => con.id() === id)

  if (container) {
    activeContainer(container)
  }
})

state.containers.subscribe(list => {
  const activeId = activeContainerId()
  if (!activeId) {
    return
  }

  const currContainer = activeContainer()
  if (activeId !== currContainer.id()) {
    const container = list.find(con => con.id() === activeId)
    if (container) {
      activeContainer(container)
    }
  }
})
