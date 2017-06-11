import * as ko from 'knockout'
import * as fs from 'fs'

type Context = {
  element: Element,
  templateNodes: Element[]
}

class LinkVM {
  reference = ko.observable('')
  className = ko.observable('')

  constructor(params: { href: string }, info: Context) {
    this.className(info.element.className || '')
    info.element.className = ''
    this.reference(params.href)
  }

  navigate = () => {
    window.history.pushState({}, 'Concierge', this.reference())
    window.dispatchEvent(new Event('push-state'))
  }
}

ko.components.register('ko-link', {
  template: fs.readFileSync(`${__dirname}/link.html`).toString(),
  viewModel: {
    createViewModel: (params: any, info: Context) => new LinkVM(params, info)
  }
})

export default LinkVM
