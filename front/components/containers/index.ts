import state from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'

class Containers {
  containers = state.containers
}

const containers = new Containers()

ko.components.register('ko-containers', {
  template: fs.readFileSync(`${__dirname}/containers.html`),
  createViewModel: () => containers
})

