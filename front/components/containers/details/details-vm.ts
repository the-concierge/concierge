import * as ko from 'knockout'
import * as fs from 'fs'
import { activeContainer } from '../common'
import state from '../../state'

class Details {
  container = activeContainer

  proxyUrls = ko.computed(() => {
    const config = state.configuration()
    const proxyHostname = config.proxyHostname
    const proxyPort = config.conciergePort

    const name = activeContainer().name()
    const ports = activeContainer().ports()

    return ports.map(port => `http://${name}.${port}.${proxyHostname}:${proxyPort}`)
  })

  combinedUrls = ko.computed(() => {
    const container = this.container()
    const name = container.name()
    const config = state.configuration()

    const ports = this.container().ports()
    const urls = ports.map(port => {
      const internal = port.url
      const withPort = `http://${name}-${port.private}.${config.proxyHostname}:${config.conciergePort}`
      const withoutPort = `http://${name}-${port.private}.${config.proxyHostname}`
      return {
        port: port.private,
        internal,
        external: {
          withPort,
          withoutPort
        }
      }
    })
    return urls
  })
}

const viewModel = new Details()

ko.components.register('ko-container-details', {
  template: fs.readFileSync(`${__dirname}/details.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

export default viewModel
