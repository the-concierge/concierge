import * as ko from 'knockout'

class Menu {
  items = ko.observableArray([
    { name: 'Containers', component: 'ko-containers', url: ['/containers', '/'] },
    { name: 'Hosts', component: 'ko-hosts', url: ['/hosts'] },
    { name: 'Images', component: 'ko-images', url: ['/images'] },
    { name: 'Applications', component: 'ko-applications', url: ['/applications'] },
    { name: 'Concierges', component: 'ko-not-found', url: ['/concierges'] },
    { name: 'Configuration', component: 'ko-not-found', url: ['/configuration'] }
  ])

  currentItem = ko.observable(this.items()[0])

  notFoundItem = {
    name: 'Not Found',
    component: 'ko-not-found',
    paths: [],
    url: ['/not-found'],
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
    const navItem = this.items().find(item => item.url.some(u => u === path))

    if (navItem) {
      this.currentItem(navItem)
      return
    }

    this.currentItem(this.notFoundItem)
  }
}

const menu = new Menu()

export default menu
