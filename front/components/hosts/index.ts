import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Hosts {
  hosts = state.hosts

  modalActive = ko.observable(false)
  editModalActive = ko.observable(false)

  hostname = ko.observable('')
  vanityHostname = ko.observable('')
  capacity = ko.observable(5)
  privateKey = ko.observable('')
  password = ko.observable('')
  username = ko.observable('')
  sshPort = ko.observable(22)
  dockerPort = ko.observable(2375)

  displayAuth = ko.observable('Password')

  isPassword = ko.computed(() => this.displayAuth() === 'Password')
  isKey = ko.computed(() => this.displayAuth() === 'Key')

  modifiedHost = {
    id: 0,
    hostname: ko.observable(''),
    vanityHostname: ko.observable(''),
    sshUsername: ko.observable(''),
    privateKey: ko.observable(''),
    password: ko.observable(''),
    capacity: ko.observable(5),
    sshPort: ko.observable(22),
    dockerPort: ko.observable(2375)
  }

  editHost = (host: Concierge.Host) => {
    const mod = this.modifiedHost
    mod.id = host.id
    mod.hostname(host.hostname)
    mod.vanityHostname(host.vanityHostname)
    mod.sshUsername(host.sshUsername)
    mod.password('')
    mod.privateKey('')
    mod.capacity(host.capacity)
    mod.dockerPort(host.dockerPort)
    mod.sshPort(host.sshPort)
    this.editModalActive(true)
  }

  hideEditModal = () => this.editModalActive(false)

  useKey = () => this.displayAuth('Key') || true
  usePassword = () => this.displayAuth('Password') || true

  hideModal = () => {
    this.modalActive(false)
  }

  showModal = () => {
    this.hostname('')
    this.vanityHostname('')
    this.capacity(5)
    this.privateKey('')
    this.sshPort(22)
    this.dockerPort(2375)
    this.modalActive(true)
  }

  saveEditHost = async () => {
    const mod = this.modifiedHost
    const body = {
      hostname: mod.hostname(),
      vanityHostname: mod.vanityHostname(),
      sshUsername: mod.sshUsername(),
      sshPort: mod.sshPort(),
      capacity: mod.capacity(),
      key: mod.password() || mod.privateKey(),
      dockerPort: mod.dockerPort()
    }

    for (const key of Object.keys(body)) {
      if (!body[key]) {
        delete body[key]
      }
    }

    const result = await fetch(`/api/hosts/${mod.id}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status < 400) {
      this.editModalActive(false)
      state.toast.success('Successfully updated host')
      state.getHosts()
      return
    }

    const msg = await result.json()

    state.toast.error(`Failed to update host: ${msg.message}`)
  }

  createHost = async () => {
    const hostname = this.hostname()
    const vanityHostname = this.vanityHostname() || hostname
    const capacity = this.capacity() || 5
    const sshUsername = this.username()
    const sshPort = this.sshPort() || 22
    const dockerPort = this.dockerPort() || 2375
    const key = this.displayAuth() === 'key'
      ? this.privateKey()
      : this.password()

    const url = `/api/hosts`

    const result = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        hostname,
        vanityHostname,
        capacity,
        dockerPort,
        sshPort,
        sshUsername,
        privateKey: key
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status === 200) {
      this.hideModal()
      state.getHosts()
      state.toast.success('Successfully created host')
      return
    }

    const error = await result.json()
    state.toast.error(`Failed to create host: ${error.message}`)
  }
}

const hosts = new Hosts()

ko.components.register('ko-hosts', {
  template: fs.readFileSync(`${__dirname}/hosts.html`).toString(),
  viewModel: {
    createViewModel: () => hosts
  }
})
