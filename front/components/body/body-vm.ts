import * as ko from 'knockout'
import menu from '../menu'
import state from '../state'

class Body {
  items = menu.items
  displayItems = menu.displayItems
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
  template: require('./body.html'),
  viewModel: {
    createViewModel: () => body
  }
})
