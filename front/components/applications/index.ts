import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Applications {
  applications = state.applications

  name = ko.observable('')
  repository = ko.observable('')
  key = ko.observable('')

  modalActive = ko.observable(false)

  refresh = () => state.getApplications()

  showModal = () => {
    this.repository('')
    this.name('')
    this.key('')
    this.modalActive(true)
  }

  hideModal = () => this.modalActive(false)

  createApplication = async () => {
    const repository = this.repository()
    const name = this.name()
    const key = this.key()

    const result = await fetch(`/api/applications?name=${name}&repository=${repository}&key=${key}`, {
      method: 'POST'
    })

    if (result.status === 200) {
      this.refresh()
      state.toast.success('Successfully created application')
      this.hideModal()
      return
    }
    const error = await result.json()
    state.toast.error(`Failed to create application: ${error.message}`)
  }
}

const applications = new Applications()

ko.components.register('ko-applications', {
  template: fs.readFileSync(`${__dirname}/applications.html`).toString(),
  viewModel: {
    createViewModel: () => applications
  }
})