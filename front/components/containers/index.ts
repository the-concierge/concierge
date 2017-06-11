import state from '../state'
import * as ko from 'knockout'
import * as fs from 'fs'
import './container'

class Containers {
  containers = state.containers
}

const viewModel = new Containers()

ko.components.register('ko-containers', {
  template: fs.readFileSync(`${__dirname}/containers.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})
