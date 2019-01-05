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
            <InputText v-model="edit.name">Name</InputText>

            <InputText v-model="edit.dockerfile">
              Dockerfile
              <cite>The Dockerfile to use inside the repository</cite>
            </InputText>

            <InputText v-model="edit.label">
              Label
              <cite>The Docker image tag 'prefix'. E.g. myproject/myrepo</cite>
            </InputText>

            <InputSwitch v-model="edit.autoBuild">Automatically build branches and tags</InputSwitch>

            <InputText v-model="edit.repository">Repository</InputText>

            <SelectList
              v-if="creds.length > 1"
              v-model="selectedCredentialsId"
              v-bind:options="creds"
            >Credentials</SelectList>
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
import InputSwitch from '../elements/InputSwitch.vue'
import InputText from '../elements/InputText.vue'
import SelectList from '../elements/SelectList.vue'
import Modal from '../elements/Modal.vue'

type ComputedCredential = Credential & { label: string }

export default Vue.extend({
  components: { InputSwitch, InputText, SelectList, Modal },
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  data() {
    return {
      modalActive: false,
      selectedCredentialsId: -1,
      creds: [] as ComputedCredential[],
      edit: {} as Application,
      app: {} as Application
    }
  },

  watch: {
    credentials: function() {
      this.creds = [
        { id: -1, label: 'None', name: 'None', username: '', key: '' },
        ...this.credentials.map(cred => ({ ...cred, label: cred.name }))
      ]
    }
  },

  methods: {
    async saveApplication() {
      const body = this.edit
      const cred = this.creds.find(cred => cred.id === this.selectedCredentialsId)
      const credId = cred ? cred.id : -1
      body.credentialsId = credId > 0 ? credId : undefined

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
          this.selectedCredentialsId = cred.id
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
