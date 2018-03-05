import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'

class EditCredentials {
  modalActive = ko.observable(false)

  id = ko.observable(0)
  name = ko.observable('')
  username = ko.observable('')
  key = ko.observable('')
  password = ko.observable('')
  privateKey = ko.observable('')

  displayAuth = ko.observable('Password')

  isPassword = ko.computed(() => this.displayAuth() === 'Password')
  isKey = ko.computed(() => this.displayAuth() === 'Key')
  originalCredentials: Concierge.Credentials = {} as any

  useKey = () => this.displayAuth('Key') || true
  usePassword = () => this.displayAuth('Password') || true

  hideModal = () => {
    this.modalActive(false)
  }

  reset = () => {
    this.id(0)
    this.name('')
    this.username('')
    this.key('')
    this.modalActive(true)
  }

  editCredentials = (creds: Concierge.Credentials) => {
    this.id(creds.id)
    this.originalCredentials = creds
    this.name(creds.name)
    this.username(creds.username)
    this.key('')
    this.modalActive(true)
  }

  saveCredentials = async () => {
    const body = {
      name: this.name(),
      username: this.username(),
      key: this.password() || this.privateKey()
    } as any

    const originalCreds = this.originalCredentials as any

    for (const key of Object.keys(body)) {
      if (key === 'key' && !body.key) {
        delete body.key
        continue
      }

      // If the original is empty and the "modified" is empty, the empty field isn't being modified
      // Therefore do not send the value (empty string) in the request body
      if (!body[key] && !originalCreds[key]) {
        delete body[key]
      }
    }

    const result = await fetch(`/api/credentials/${this.id()}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status < 400) {
      this.modalActive(false)
      state.toast.success('Successfully updated credentials')
      state.getCredentials()
      return
    }

    const msg = await result.json()

    state.toast.error(`Failed to update credentials: ${msg.message}`)
  }
}

const viewModel = new EditCredentials()

ko.components.register('ko-edit-credentials', {
  template: fs.readFileSync(`${__dirname}/edit-credentials.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
