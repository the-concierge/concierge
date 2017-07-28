import * as ko from 'knockout'
import * as fs from 'fs'
import createHost from './create'
import editHost from './edit'
import state from '../state'

class Hosts {
  hosts = state.hosts
  showEditHost = editHost.editHost
  showCreateHost = () => createHost.showModal()
}

const hosts = new Hosts()

ko.components.register('ko-hosts', {
  template: fs.readFileSync(`${__dirname}/hosts.html`).toString(),
  viewModel: {
    createViewModel: () => hosts
  }
})
