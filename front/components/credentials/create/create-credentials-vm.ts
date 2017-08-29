import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'

class CreateCredentials {
  modalActive = ko.observable(false)

  name = ko.observable('')
  username = ko.observable('')
  key = ko.observable('')
  password = ko.observable('')

  constructor() {
    this.password.subscribe(pwd => {
      if (pwd.length > 0 && this.key().length > 0) { this.key('') }
    })

    this.key.subscribe(key => {
      if (key.length > 0 && this.password().length > 0) { this.password('') }
    })
  }

  showModal = () => {
    this.name('')
    this.username('')
    this.password('')
    this.key('')
    this.modalActive(true)
  }

  hideModal = () => {
    this.modalActive(false)
  }

  createCredentials = async () => {
    const name = this.name()
    const username = this.username()
    const password = this.password()
    const key = this.key()

    const result = await fetch(`/api/credentials`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        username,
        key: password || key || ''
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status === 200) {
      state.getCredentials()
      state.toast.success('Successfully created credentials')
      this.hideModal()
      return
    }
    const error = await result.json()
    state.toast.error(`Failed to create credentials: ${error.message}`)
  }
}

const viewModel = new CreateCredentials()

ko.components.register('ko-create-credentials', {
  template: fs.readFileSync(`${__dirname}/create-credentials.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel