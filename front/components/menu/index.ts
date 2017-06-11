import * as ko from 'knockout'
import * as fs from 'fs'

class Menu {
  items = ko.observableArray([
    { name: 'Containers', component: 'ko-containers', url: '/containers' },
    { name: 'Hosts', component: 'ko-hosts', url: '/hosts' },
    { name: 'Images', component: 'ko-images', url: '/images' },
    { name: 'Applications', component: 'ko-applications', url: '/applications' },
    { name: 'Concierges', component: 'ko-concierges', url: '/concierges' },
    { name: 'Configuration', component: 'ko-configuration', url: '/configuration' }
  ])

  currentItem = ko.observable(this.items()[0])

  notFoundItem = {
    name: 'Not Found',
    component: 'ko-not-found',
    paths: [],
    url: '/not-found',
    display: false
  }

  constructor() {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener('push-state', () => {
      this.navigate()
    })

    window.addEventListener('popstate', () => {
      this.navigate()
    })

    this.navigate()
  }

  navigate = () => {
    const path = window.location.pathname
    const navItem = this.items().find(item => item.url === path)

    if (navItem) {
      this.currentItem(navItem)
      return
    }

    this.currentItem(this.notFoundItem)
  }
}

const menu = new Menu()

ko.components.register('ko-menu', {
  template: fs.readFileSync(`${__dirname}/menu.html`).toString(),
  viewModel: {
    createViewModel: () => menu
  }
})

export default menu
