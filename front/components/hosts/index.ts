import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Hosts {
  hosts = state.hosts
}

const hosts = new Hosts()

ko.components.register('ko-hosts', {
  template: fs.readFileSync(`${__dirname}/hosts.html`).toString(),
  viewModel: {
    createViewModel: () => hosts
  }
})
