import * as ko from 'knockout'
import menu from '../menu'

type Context = {
  element: Element
  templateNodes: Element[]
}

export class Link {
  reference = ko.observable('')
  className = ko.observable('')

  constructor(params: { href: string }, info: Context) {
    this.className(info.element.className || '')
    info.element.className = ''
    const ref = ko.unwrap(params.href)
    this.reference(ref)
  }

  navigate = () => menu.navigateTo(this.reference())
}

ko.components.register('ko-link', {
  template: require('./link.html'),
  viewModel: {
    createViewModel: (params: any, info: Context) => new Link(params, info)
  }
})

export default Link
