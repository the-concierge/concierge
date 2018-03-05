import * as ko from 'knockout'
import createHost from './create'
import editHost from './edit'
import state from '../state'
import menu from '../menu'

class Hosts {
  hosts = state.hosts
  showEditHost = editHost.editHost
  showCreateHost = () => createHost.showModal()
}

const hosts = new Hosts()

ko.components.register('ko-hosts', {
  template: require('./hosts.html'),
  viewModel: {
    createViewModel: () => hosts
  }
})

menu.register({
  path: '/hosts',
  item: { component: 'ko-hosts', name: 'Hosts' },
  position: 40
})
