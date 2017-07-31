import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../../state'
import { activeContainer } from '../common'

class Logs {
  container = activeContainer
  follow = ko.observable(false)
  logs = ko.observableArray<string>([])
  tail = ko.observable(50)

  constructor() {
    activeContainer.subscribe(container => {
      if (!container.id()) {
        return
      }

      this.getLogs()
    })
  }

  getLogs = async () => {
    const result = await fetch(`/api/containers/${this.container().id()}/logs/${this.container().host.id}?tail=${this.tail()}`)
    if (result.status >= 400) {
      state.toast.error(`Failed to retrieve container logs: ${result.statusText}`)
      return
    }

    const logs = await result.json()
    this.logs.removeAll()
    this.logs(logs)
  }
}

const viewModel = new Logs()

ko.components.register('ko-container-logs', {
  template: fs.readFileSync(`${__dirname}/logs.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel