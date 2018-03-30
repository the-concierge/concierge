<template>
  <div>
    <div class="container">
      <div class="columns">
        <div class="col-1">
          <button class="btn btn-md" v-on:click="editConfig" :disabled="isEditing" style="width: 100%">Edit</button>
        </div>

        <div class="divider-vert"></div>

        <div class="col-1">
          <button class="btn btn-md" v-on:click="cancelEditing" :disabled="!isEditing" style="width: 100%">Cancel</button>
        </div>

        <div class="divider-vert"></div>

        <div class="col-1">
          <button class="btn btn-md" v-on:click="saveConfig" :disabled="!isEditing" style="width: 100%">Save</button>
        </div>

        <div class="divider-vert"></div>

        <div class="col-9"></div>

      </div>
    </div>

    <div class="form-horizontal" v-for="(f, i) of fields" :key="i">
      <div class="form-group">
        <div class="col-3">
          <label class="form-label">{{f.label}}</label>
        </div>
        <div class="col-4">
          <input v-if="f.type === 'text'" :disabled="!isEditing" v-model="f.value" v-bind:class="f.value === f.original ? '' : 'is-success'" type="text" class="form-input" />

          <select v-if="f.type === 'dropdown'" v-model="f.value.value" :disabled="!isEditing" v-bind:class="f.value.value === f.original.value ? '': 'is-success'" class="form-select">
            <option v-for="o in f.options" v-bind:value="o.value" :key="o.value">
              {{ o.text }}
            </option>
          </select>

        </div>
        <div class="col-5"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Configuration, Credential } from './api'

export default Vue.extend({
  props: {
    config: { type: Object as () => Configuration },
    credentials: { type: Array as () => Credential[] }
  },
  data() {
    return {
      fields: [] as any[],
      isEditing: false
    }
  },
  methods: {
    editConfig() {
      this.isEditing = true
    },
    cancelEditing() {
      this.resetFields()
      this.isEditing = false
    },
    resetFields() {
      const credOptions = [
        { text: 'None', value: -1 },
        ...this.credentials.map(cred => ({ text: cred.name, value: cred.id }))
      ]

      const fields = [
        textInput('name', 'Name', this.config),
        textInput('proxyHostname', 'Proxy Hostname', this.config),
        textInput('debug', 'Debug Level', this.config),
        textInput('statsBinSize', 'Samples per Bin (1Hz)', this.config),
        textInput('statsRetentionDays', 'Stats Retention Time (days)', this.config),
        textInput('dockerRegistry', 'Docker Registry URL', this.config),
        dropdown('registryCredentials', 'Docker Registry Credentials', credOptions, this.config)
      ]

      this.fields = fields
    },
    saveConfig() {
      const cfg = { ...this.config }
      for (const field of this.fields) {
        cfg[field.name as TConf] = field.value.value || field.value
      }

      if (cfg.registryCredentials === -1) {
        delete cfg.registryCredentials
      }

      console.log('SaveConfig', cfg)
    }
  },
  mounted() {
    this.resetFields()
  }
})

type TConf = keyof Configuration

function textInput(name: TConf, label: string, cfg: Configuration) {
  const element = {
    type: 'text',
    label,
    name,
    value: cfg[name],
    original: cfg[name]
  }

  return element
}

interface DropdownOption {
  text: string
  value: any
}

function dropdown(name: TConf, label: string, options: DropdownOption[], cfg: Configuration) {
  const currOpt = options.find(opt => opt.value === cfg.registryCredentials) || options[0]
  const element = {
    type: 'dropdown',
    name,
    label,
    options,
    value: { ...currOpt },
    original: { ...currOpt }
  }

  return element
}
</script>

