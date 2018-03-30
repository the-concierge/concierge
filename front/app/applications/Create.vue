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
                <i class="form-icon" v-on:click="toggleAutoBuild(_, event)"></i>
                Automatically build branches and tags
              </label>
            </div>

            <div class="form-group" v-if="creds.length > 0">
              <label class="form-label">Credentials</label>
              <select class="form-select" v-model="selectedCredentials">
                <option v-for="cred in creds" :key="cred.value" v-bind:value="cred.value">
                  {{cred.name}}
                </option>
              </select>
            </div>

            <!-- <div class="form-group" v-if="selectedCredentials.value > -1">
              <label class="form-label">Username
                <cite>Optional: This can be provided in the Git repository</cite>
              </label>
              <input class="form-input" type="text" data-bind="textInput: username" placeholder="Optional" />
            </div>

            <b>Use either Password or Key -- Provide a password if you are using HTTP/HTTPS over SSH</b>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" data-bind="textInput: password" />
            </div>

            <div class="form-group">
              <label class="form-label">Key</label>
              <textarea class="form-input" type="password" data-bind="textInput: key"></textarea>
            </div> -->

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
    toggleAutoBuild(_: any, event: any) {
      event.preventDefault()
      this.autoBuild = !this.autoBuild
      return true
    },
    hideModal() {
      this.modalActive = false
    },
    createApplication() {}
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