import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'

class CreateApp {
  modalActive = ko.observable(false)

  name = ko.observable('')
  repository = ko.observable('')
  username = ko.observable('')
  key = ko.observable('')
  password = ko.observable('')
  label = ko.observable('')
  dockerfile = ko.observable('')

  constructor() {
    this.password.subscribe(pwd => {
      if (pwd.length > 0 && this.key().length > 0) { this.key('') }
    })

    this.key.subscribe(key => {
      if (key.length > 0 && this.password().length > 0) { this.password('') }
    })
  }

  showModal = () => {
    this.repository('')
    this.name('')
    this.username('')
    this.password('')
    this.key('')
    this.label('')
    this.modalActive(true)
  }

  hideModal = () => {
    this.modalActive(false)
  }

  createApplication = async () => {
    const repository = this.repository()
    const name = this.name()
    const username = this.username()
    const password = this.password()
    const key = this.key()
    const label = this.label()
    const dockerfile = this.dockerfile()

    const result = await fetch(`/api/applications?name=${name}&repository=${repository}&username=${username}&key=${password || key}&label=${label}&dockerfile=${dockerfile}`, {
      method: 'POST'
    })

    if (result.status === 200) {
      state.getApplications()
      state.toast.success('Successfully created application')
      this.hideModal()
      return
    }
    const error = await result.json()
    state.toast.error(`Failed to create application: ${error.message}`)
  }
}

const viewModel = new CreateApp()

ko.components.register('ko-create-application', {
  template: fs.readFileSync(`${__dirname}/create-app.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel