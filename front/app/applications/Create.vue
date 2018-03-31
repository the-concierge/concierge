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
              <input class="form-input" type="text" v-model="name" />
            </div>

            <div class="form-group">
              <label class="form-label">Dockerfile
                <cite>The Dockerfile to use inside the repository</cite>
              </label>
              <input class="form-input" type="text" v-model="dockerfile" />
            </div>

            <div class="form-group">
              <label class="form-label">Label
                <cite>The Docker image tag 'prefix'. E.g. myproject/myrepo</cite>
              </label>
              <input class="form-input" type="text" v-model="label" />
            </div>

            <div class="form-group">
              <label class="form-label">Repository</label>
              <input class="form-input" type="text" v-model="repository" />
            </div>

            <div class="form-group">
              <label class="form-switch">
                <input type="checkbox" data-bind="checked: autoBuild" />
                <i class="form-icon" v-on:click="toggleAutoBuild"></i>
                Automatically build branches and tags
              </label>
            </div>

            <div class="form-group" v-if="creds.length > 0">
              <label class="form-label">Credentials</label>
              <select class="form-select" v-model="selectedCredentials">
                <option v-for="cred in creds" :key="cred.value" v-bind:value="selectedCredentials">
                  {{cred.name}}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="selectedCredentials.value > 0">
              <label class="form-label">Username
                <cite>Optional: This can be provided in the Git repository</cite>
              </label>
              <input class="form-input" type="text" v-model="username" placeholder="Optional" />
            </div>

            <b>Use either Password or Key -- Provide a password if you are using HTTP/HTTPS over SSH</b>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" v-model="password" />
            </div>

            <div class="form-group">
              <label class="form-label">Key</label>
              <textarea class="form-input" type="password" v-model="key"></textarea>
            </div>

          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="createApplication">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Credential } from '../api'
import { toast, refresh } from '../common'

export default Vue.extend({
  props: {
    credentials: { type: Object as () => Credential[] }
  },
  data() {
    return {
      modalActive: false,
      selectedCredentials: { name: 'None', value: -1 },
      name: '',
      dockerfile: '',
      label: '',
      repository: '',
      autoBuild: false,
      username: '',
      password: '',
      key: ''
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
        username: this.username,
        password: this.password,
        key: this.key,
        label: this.label,
        dockerfile: this.dockerfile,
        credentialsId: this.selectedCredentials.value,
        autoBuild: this.autoBuild
      }
      const result = await fetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify(app),
        headers: { 'Content-Type': 'application/json' }
      })

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