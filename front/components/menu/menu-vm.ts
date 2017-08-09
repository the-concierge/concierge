import * as ko from 'knockout'
import mm from 'multiple-dispatch'

export type MenuItem = {
  name: string
  component: string
  hide?: boolean
}

export type Handler = {
  run?: (resource: string, id: string, subResource: string) => void
  item: MenuItem
  path: string
}

const router = mm<Handler, any>({
  name: 'router',
  throw: false,
  ignoreArity: true,
  params: [
    {
      // E.g. /containers
      name: 'resource'
    },
    {
      // E.g. /containers/:id
      name: 'resource id',

      // If overriden, pass through if incoming is provided
      // If not overriden, pass through if incoming is not provided
      isa: (incoming, override) => override ? !!incoming : incoming === undefined
    },
    {
      // E.g. /containers/:id/inspect
      name: 'sub-resource',

      // If it's overridden, expect strict equality
      // If not overrideden, do not pass through
      isa: (incoming, override) => override === undefined ? incoming === undefined : override === incoming
    }
  ]
})

class Menu {
  items = ko.observableArray<MenuItem & { path: string }>([])

  displayItems = ko.computed(() => {
    return this
      .items()
      .filter(item => item.hide !== true)
  })

  notFoundItem = {
    name: 'Not Found',
    component: 'ko-not-found'
  }

  emptyItem = {
    name: '',
    component: 'ko-empty'
  }

  currentItem = ko.observable<MenuItem>(this.emptyItem)

  constructor() {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener('push-state', () => {
      this.navigateTo(window.location.pathname)
    })

    window.addEventListener('popstate', () => {
      this.navigateTo(window.location.pathname)
    })

    // Route providers require this module
    // Module loading happens synchronously, so we can navigate on initial load
    // on the next tick to avoid 404ing because no routes exist yet
    setTimeout(() => this.navigateTo(window.location.pathname))
  }

  register = (handler: Handler) => {
    const [resource, id, subResource] = handler.path.split('/').slice(1)

    const existingItem = this.items().find(item => item.name === handler.item.name)
    if (!existingItem) {
      this.items.push({ ...handler.item, path: handler.path })
    }

    router.override([resource, !!id, subResource], () => handler)
  }

  navigateTo = (path: string) => {
    const [resource, id, subResource] = path.split('/').slice(1)
    const handler = router.dispatch(resource, id, subResource)
    window.history.pushState({}, 'Concierge', path)

    if (!handler) {
      this.currentItem(this.notFoundItem)
      return
    }

    if (typeof handler.run === 'function') {
      handler.run(resource, id, subResource)
    }

    this.currentItem(handler.item)
  }
}

const menu = new Menu()

export default menu
