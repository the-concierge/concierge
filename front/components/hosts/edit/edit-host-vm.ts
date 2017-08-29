import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'

class EditHost {
  modalActive = ko.observable(false)

  hostId = ko.observable(0)
  hostname = ko.observable('')
  proxyIp = ko.observable('')
  vanityHostname = ko.observable('')
  capacity = ko.observable(5)
  privateKey = ko.observable('')
  password = ko.observable('')
  sshUsername = ko.observable('')
  sshPort = ko.observable(22)
  dockerPort = ko.observable(2375)

  displayAuth = ko.observable('Password')

  isPassword = ko.computed(() => this.displayAuth() === 'Password')
  isKey = ko.computed(() => this.displayAuth() === 'Key')

  originalHost: Concierge.Host

  useKey = () => this.displayAuth('Key') || true
  usePassword = () => this.displayAuth('Password') || true

  hideModal = () => {
    this.modalActive(false)
  }

  reset = () => {
    this.hostname('')
    this.proxyIp('')
    this.vanityHostname('')
    this.sshUsername('')
    this.capacity(5)
    this.privateKey('')
    this.sshPort(22)
    this.dockerPort(2375)
    this.modalActive(true)
  }

  editHost = (host: Concierge.Host) => {
    this.originalHost = host
    this.hostId(host.id)
    this.hostname(host.hostname)
    this.proxyIp(host.proxyIp)
    this.vanityHostname(host.vanityHostname)
    this.sshUsername(host.sshUsername)
    this.password('')
    this.privateKey('')
    this.capacity(host.capacity)
    this.dockerPort(host.dockerPort)
    this.sshPort(host.sshPort)
    this.modalActive(true)
  }

  saveHost = async () => {
    const body = {
      hostname: this.hostname(),
      proxyIp: this.proxyIp(),
      vanityHostname: this.vanityHostname(),
      sshUsername: this.sshUsername(),
      sshPort: this.sshPort(),
      capacity: this.capacity(),
      key: this.password() || this.privateKey(),
      dockerPort: this.dockerPort()
    }

    for (const key of Object.keys(body)) {
      if (key === 'key' && !body.key) {
        delete body.key
        continue
      }

      // If the original is empty and the "modified" is empty, the empty field isn't being modified
      // Therefore do not send the value (empty string) in the request body
      if (!body[key] && !this.originalHost[key]) {
        delete body[key]
      }
    }

    const result = await fetch(`/api/hosts/${this.hostId()}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status < 400) {
      this.modalActive(false)
      state.toast.success('Successfully updated host')
      state.getHosts()
      return
    }

    const msg = await result.json()

    state.toast.error(`Failed to update host: ${msg.message}`)
  }
}

const viewModel = new EditHost()

ko.components.register('ko-edit-host', {
  template: fs.readFileSync(`${__dirname}/edit-host.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel