<template>
  <div class="modal" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Create Application</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" type="text" v-model="name">
            </div>

            <div class="form-group">
              <label class="form-label">
                Dockerfile
                <cite>The Dockerfile to use inside the repository</cite>
              </label>
              <input class="form-input" type="text" v-model="dockerfile">
            </div>

            <div class="form-group">
              <label class="form-label">
                Label
                <cite>The Docker image tag 'prefix'. E.g. myproject/myrepo</cite>
              </label>
              <input class="form-input" type="text" v-model="label">
            </div>

            <div class="form-group">
              <label class="form-label">Repository</label>
              <input class="form-input" type="text" v-model="repository">
            </div>

            <div class="form-group">
              <label class="form-switch">
                <input type="checkbox" v-model="autoBuild">
                <i class="form-icon" v-on:click="toggleAutoBuild"></i>
                Automatically build branches and tags
              </label>
            </div>

            <div class="form-group" v-if="creds.length > 0">
              <label class="form-label">Credentials</label>
              <select class="form-select" v-model="selectedCredentials">
                <option
                  v-for="cred in creds"
                  :key="cred.value"
                  v-bind:value="selectedCredentials"
                >{{cred.name}}</option>
              </select>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button
          v-if="isLoading"
          class="btn btn-md"
          v-on:click="createApplication"
          disabled="true"
          style="width: 120px"
        >
          <div class="loading"></div>
        </button>
        <button
          v-if="!isLoading"
          class="btn btn-md"
          v-on:click="createApplication"
          style="width: 120px"
        >Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Credential } from '../api'
import { toast, refresh } from '../common'

interface Data {
  isLoading: boolean
  modalActive: boolean
  selectedCredentials: { name: string; value: number }
  name: string
  dockerfile: string
  label: string
  repository: string
  autoBuild: boolean
}

export default Vue.extend({
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  data(): Data {
    return {
      isLoading: false,
      modalActive: false,
      selectedCredentials: { name: 'None', value: -1 },
      name: '',
      dockerfile: '',
      label: '',
      repository: '',
      autoBuild: true
    }
  },
  mounted() {
    onShowModal(() => (this.modalActive = true))
  },
  methods: {
    toggleAutoBuild() {
      this.autoBuild = !this.autoBuild
      return true
    },
    hideModal() {
      this.modalActive = false
    },
    async createApplication() {
      const app = {
        repository: this.repository,
        name: this.name,
        label: this.label,
        dockerfile: this.dockerfile,
        credentialsId: this.selectedCredentials.value,
        autoBuild: this.autoBuild
      }

      this.isLoading = true
      const result = await fetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify(app),
        headers: { 'Content-Type': 'application/json' }
      })
      this.isLoading = false
      if (result.status === 200) {
        refresh.applications()
        toast.success('Successfully created application')
        this.hideModal()
        return
      }

      const error = await result.json()
      toast.error(`Failed to create application: ${error.message}`)
    }
  },
  computed: {
    creds: function(): Array<{ name: string; value: number }> {
      const creds = this.credentials || []
      return [
        { name: 'None', value: -1 },
        ...creds.map(cred => ({ name: cred.name, value: cred.id }))
      ]
    }
  }
})

let _onShow: Function = () => {}
function onShowModal(callback: Function) {
  _onShow = callback
}

export function showModal() {
  _onShow()
}
</script>