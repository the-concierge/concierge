import * as ko from 'knockout'
import state from '../state'
import menu from '../menu'

class Configuration {
  config = state.configuration
  credentials = ko.observableArray<{ text: string; value: number | null }>([
    { text: 'None', value: null }
  ])

  original = ko.observable<Partial<Concierge.Configuration>>({})
  isEditing = ko.observable(false)

  fields = [
    textInput('name', 'Name'),
    textInput('proxyHostname', 'Proxy Hostname'),
    textInput('debug', 'Debug Level'),
    textInput('statsBinSize', 'Samples per Bin (1Hz)'),
    textInput('statsRetentionDays', 'Stats Retention Time (days)'),
    textInput('dockerRegistry', 'Docker Registry URL'),
    dropdown('registryCredentials', 'Docker Registry Credentials', this.credentials)
  ]

  constructor() {
    this.config.subscribe(config => {
      this.original({ ...config })

      for (const key of Object.keys(config) as Array<keyof typeof config>) {
        const field = this.fields.find(field => field.name === key)
        if (!field) {
          continue
        }

        if (field.type === 'text') {
          field.original(config[key])
          field.value(config[key])
        }

        if (field.name === 'registryCredentials') {
          const original = this.credentials().find(
            cred => cred.value === config.registryCredentials
          )

          field.original(original)
          field.value(original)
        }
      }
    })

    state.credentials.subscribe(creds => {
      const stored = this.credentials()
      for (const cred of creds) {
        const existing = stored.find(store => store.value === cred.id)
        if (existing) {
          this.credentials.replace(existing, { text: cred.name, value: cred.id })
          continue
        }
        this.credentials.push({ text: cred.name, value: cred.id })
      }

      for (const cred of this.credentials()) {
        if (cred.value === null) {
          continue
        }

        const isDeleted = creds.every(c => c.id !== cred.value)
        if (isDeleted) {
          this.credentials.remove(cred)
        }
      }
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
    const config: any = {}
    for (const field of this.fields) {
      if (field.type === 'dropdown') {
        config[field.name] = field.value().value
        continue
      }

      config[field.name] = field.value()
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
    const original = this.original()

    for (const field of this.fields) {
      field.value(original[field.name])
    }
  }

  refresh = () => state.getConfiguration()
}

const viewModel = new Configuration()

ko.components.register('ko-configuration', {
  template: require('./configuration.html'),
  viewModel: {
    createViewModel: () => viewModel
  }
})

menu.register({
  path: '/configuration',
  item: { component: 'ko-configuration', name: 'Configuration' },
  position: 60
})

function textInput<TProp extends keyof Concierge.Configuration>(name: TProp, label: string) {
  const element = {
    type: 'text',
    label,
    name,
    value: ko.observable<any>(),
    original: ko.observable<any>()
  }

  return {
    ...element,
    style: ko.computed(() => (element.value() === element.original() ? '' : 'is-success'))
  }
}

interface DropdownOption {
  text: string
  value: any
}

function dropdown<TProp extends keyof Concierge.Configuration>(
  name: TProp,
  label: string,
  options: KnockoutObservableArray<DropdownOption> | KnockoutComputed<DropdownOption[]>
) {
  const element = {
    type: 'dropdown',
    name,
    label,
    options,
    value: ko.observable<any>(),
    original: ko.observable<any>()
  }

  return {
    ...element,
    style: ko.computed(() => (isEqual(element.value(), element.original()) ? '' : 'is-success'))
  }
}

function isEqual(left: DropdownOption, right: DropdownOption) {
  if (!left || !right) {
    return false
  }

  return left.value === right.value
}
