import { ContainerInfo } from 'dockerode'
import * as fs from 'fs'
import * as ko from 'knockout'

export interface Params {
  container: Concierge.APIContainer
}

export default class Container {
  original: Partial<ContainerInfo> = {}
  container: KnockoutObservable<Partial<ContainerInfo>> = ko.observable({
    Id: '',
    Names: ['']
  })

  constructor(params: Params) {
    this.original = params.container
    this.container(params.container)
  }
}

ko.components.register('ko-container', {
  template: fs.readFileSync(`${__dirname}/container.html`).toString(),
  viewModel: {
    createViewModel: (params: Params) => new Container(params)
  }
})
