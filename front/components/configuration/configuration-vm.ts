import * as ko from 'knockout'
import * as fs from 'fs'
import state from '../state'
import menu from '../menu'

class Configuration {
  config = state.configuration
  original = ko.observable<Partial<Concierge.Configuration>>({})
  isEditing = ko.observable(false)
  labels: { [label: string]: string } = {
    name: 'Name',
    proxyHostname: 'Proxy Hostname',
    debug: 'Debug Level',
    dockerRegistry: 'Docker Registry',
    statsBinSize: 'Stats Samples per Bin (1Hz)',
    statsRetentionDays: 'Stats Retention Time (days)'
  }

  fields = ko.computed(() => {
    const cfg = this.config() as { [key: string]: any }
    delete cfg['conciergePort']

    return Object.keys(cfg).map(key => {
      const value = ko.observable(cfg[key])

      const cls = ko.computed(() => {
        const originalValue = (this.original() as any)[key]
        return value() === originalValue ? '' : 'is-success'
      })

      return {
        key,
        value,
        cls,
        label: this.labels[key] || key
      }
    })
  })

  constructor() {
    this.config.subscribe(config => {
      this.original({ ...config })
    })
  }

  editConfig = () => {
    const current = this.config()
    const keys = Object.keys(current)

    if (keys.length === 0) {
      state.toast.error('Unable to edit configuration: Unable to retrieve current configuration')
      return
    }

    this.isEditing(true)
  }

  saveConfig = async () => {
    const fields = this.fields()
    const config: any = {}
    for (const field of fields) {
      config[field.key] = field.value()
    }

    const result = await fetch('/api/configuration', {
      method: 'POST',
      body: JSON.stringify(config),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (result.status < 400) {
      state.toast.success('Successfully updated configuration')
      this.refresh()
      this.isEditing(false)
      return
    }

    const msg = await result.json()
    state.toast.error(`Failed to update configuration: ${msg.message}`)
  }

  cancelEditing = () => {
    this.isEditing(false)
    const original = this.original() as { [key: string]: any }
    const fields = this.fields()

    for (const field of fields) {
      field.value(original[field.key])
    }
  }

  refresh = () => state.getConfiguration()
}

const viewModel = new Configuration()

ko.components.register('ko-configuration', {
  template: fs.readFileSync(`${__dirname}/configuration.html`).toString(),
  viewModel: {
    createViewModel: () => viewModel
  }
})

menu.register({
  path: '/configuration',
  item: { component: 'ko-configuration', name: 'Configuration' },
  position: 60
})
