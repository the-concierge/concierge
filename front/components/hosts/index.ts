import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Hosts {
  hosts = state.hosts

  modalActive = ko.observable(false)
  hostname = ko.observable('')
  capacity = ko.observable(5)
  privateKey = ko.observable('')
  password = ko.observable('')
  sshPort = ko.observable(22)
  dockerPort = ko.observable(2375)

  displayAuth = ko.observable('none')

  isPassword = ko.computed(() => this.displayAuth() === 'password')
  isKey = ko.computed(() => this.displayAuth() === 'key')
  isNone = ko.computed(() => this.displayAuth() === 'none')

  useNone = () => this.displayAuth('none') || true
  useKey = () => this.displayAuth('key') || true
  usePassword = () => this.displayAuth('password') || true



  hideModal = () => {
    this.modalActive(false)
  }

  showModal = () => {
    this.hostname('')
    this.capacity(5)
    this.privateKey('')
    this.sshPort(22)
    this.dockerPort(2375)
    this.modalActive(true)
  }

  createHost = () => {
    const hostname = this.hostname()
    const capacity = this.capacity() || 5
    const sshPort = this.sshPort() || 22
    const dockerPort = this.dockerPort() || 2375
    const key = this.privateKey()
    const url = `/api/hosts?hostname=${hostname}&capacity=${capacity}&sshPort=${sshPort}&dockerPort=${dockerPort}&privateKey=${key}`
  }
}

const hosts = new Hosts()

ko.components.register('ko-hosts', {
  template: fs.readFileSync(`${__dirname}/hosts.html`).toString(),
  viewModel: {
    createViewModel: () => hosts
  }
})
