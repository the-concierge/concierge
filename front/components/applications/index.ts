import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'

class Applications {
  applications = state.applications

  name = ko.observable('')
  repository = ko.observable('')
  key = ko.observable('')

  modalActive = ko.observable(false)

  showModal = () => {
    this.repository('')
    this.name('')
    this.key('')
  }
  closeModal = () => this.modalActive(false)

  createImage = async () => {
    const body = {
      repository: this.repository(),
      name: this.name(),
      key: this.key()
    }

    const result = await fetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'applicaton/json'
      }
    })

    if (result.status === 200) {
      this.closeModal()
      state.getApplications()
      return
    }
  }
}

const applications = new Applications()

ko.components.register('ko-applications', {
  template: fs.readFileSync(`${__dirname}/applications.html`).toString(),
  viewModel: {
    createViewModel: () => applications
  }
})