<template>
  <div v-bind:class="{ active: modalActive }" v-if="modalActive" class="modal">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Edit Application</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form v-on:submit.prevent>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" type="text" v-model="edit.name" />
            </div>

            <div class="form-group">
              <label class="form-label">Dockerfile
                <cite>The Dockerfile to use inside the repository</cite>
              </label>
              <input class="form-input" type="text" v-model="edit.dockerfile" />
            </div>

            <div class="form-group">
              <label class="form-label">Label
                <cite>The Docker image tag 'prefix'. E.g. myproject/myrepo</cite>
              </label>
              <input class="form-input" type="text" v-model="edit.label" />
            </div>

            <div class="form-group">
              <label class="form-switch">
                <input type="checkbox" v-model="edit.autoBuild" />
                <i class="form-icon"></i>
                Automatically build branches and tags
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Repository</label>
              <input class="form-input" type="text" v-model="edit.repository" />
            </div>

            <div v-if="credentials.length > 1" class="form-group">
              <label class="form-label">Credentials</label>
              <select class="form-select" v-model="selectedCredentials">
                <options v-for="(c, i) in credentials" :key="i" v-bind:value="c">
                  {{c.name}}
                </options>
              </select>
            </div>

            <div v-if="selectedCredentials.id > 0" class="form-group">
              <label class="form-label">Username
                <cite>Optional: This can be provided in the Git repository</cite>
              </label>
              <input class="form-input" type="text" v-model="edit.username" placeholder="Optional" />
            </div>

            <b>Use either Password or Key -- Provide a password if you are using HTTP/HTTPS over SSH</b>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" v-model="edit.password" />
            </div>

            <div class="form-group">
              <label class="form-label">Key</label>
              <textarea class="form-input" type="password" v-model="edit.key"></textarea>
            </div>

          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="saveApplication">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Application, Credential } from '../api'
import { refresh, toast, createEmitter } from '../common'

export default Vue.extend({
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  data() {
    return {
      modalActive: false,
      selectedCredentials: { id: -1, name: 'None', username: '', key: '' } as Credential,
      edit: {} as Application,
      app: {} as Application
    }
  },
  methods: {
    async saveApplication() {
      const body = this.edit
      const cred = this.selectedCredentials
      body.credentialsId = cred.id > 0 ? cred.id : undefined

      for (const key of Object.keys(body) as Array<keyof typeof body>) {
        const orig = this.app[key]
        const mod = body[key]
        if (orig === mod) {
          delete body[key]
        }
      }

      const result = await fetch(`/api/applications/${this.app.id}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      })

      if (result.status === 200) {
        refresh.applications()
        toast.success('Successfully updated application')
        this.hideModal()
        return
      }

      const err = await result.json()
      toast.error(`Failed to update application: ${err.message}`, 15000)
    },
    hideModal() {
      this.modalActive = false
    }
  },
  mounted() {
    emitter.on(app => {
      this.app = app
      this.modalActive = true
      this.edit = { ...app }
      if (Number(app.credentialsId) > 0) {
        const cred = this.credentials.find(c => c.id === app.credentialsId)
        if (cred) {
          this.selectedCredentials = cred
        }
      }
    })
  }
})

const emitter = createEmitter<Application>()
export function showModal(app: Application) {
  emitter.emit(app)
}
</script>
