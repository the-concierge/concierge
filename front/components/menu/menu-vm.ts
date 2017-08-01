import * as ko from 'knockout'

class Menu {
  items = ko.observableArray<{ name: string, component: string, url: string[], hide?: boolean }>([
    { name: 'Containers', component: 'ko-containers', url: ['/containers', '/'] },
    { name: 'Containers', component: 'ko-inspect-container', url: ['/inspect'], hide: true },
    { name: 'Hosts', component: 'ko-hosts', url: ['/hosts'] },
    { name: 'Images', component: 'ko-images', url: ['/images'] },
    { name: 'Applications', component: 'ko-applications', url: ['/applications'] },
    { name: 'Configuration', component: 'ko-configuration', url: ['/configuration'] },
    { name: 'Logs', component: 'ko-logs', url: ['/logs'] }
  ])

  displayItems = ko.computed(() => {
    return this
      .items()
      .filter(item => item.hide !== true)
  })

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
