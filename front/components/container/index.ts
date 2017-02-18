import * as fs from 'fs'
import * as ko from 'knockout'

export interface Params {
  container: Concierge.APIContainer
}

export default class Container {
  id = ko.observable(0)
  dockerId = ko.observable('')
  label = ko.observable('')
  port = ko.observable(0)
  subdomain = ko.observable('')
  isProxing = ko.observable(false)
  host = ko.observable('')
  applicationId = ko.observable(0)
  applicationName = ko.observable('')
  dockerImage = ko.observable('')
  variables = ko.observable('')

  original: Partial<Concierge.APIContainer> = {}

  constructor(params: Params) {
    this.original = params.container
  }
}

ko.components.register('ko-container', {
  template: fs.readFileSync(`${__dirname}/container.html`).toString(),
  viewModel: {
    createViewModel: (params: Params) => new Container(params)
  }
})