import * as ko from 'knockout'
import { ObservableContainer } from '../state'

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

export const activeContainer: KnockoutObservable<ObservableContainer> = ko.observable(defaultContainer)