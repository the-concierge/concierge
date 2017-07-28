import * as ko from 'knockout'
import * as fs from 'fs'
import menu from '../menu'
import state from '../state'

class Body {
  items = menu.items
  item = menu.currentItem
  toasts = state.toasts

  component = ko.computed(() => {
    const item = this.item()
    if (!item) {
      return 'ko-loading'
    }

    return item.component
  })
}

const body = new Body()

ko.components.register('ko-body', {
  template: fs.readFileSync(`${__dirname}/body.html`).toString(),
  viewModel: {
    createViewModel: () => body
  }
})
