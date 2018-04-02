<template>
  <div class="modal" v-if="modalActive" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Edit Credentials</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" type="text" v-model="edit.name" />
            </div>

            <div class="form-group">
              <label class="form-label">SSH Authorisation Style</label>
              <label class="form-radio">
                <input type="radio" value="Key" v-model="displayAuth" />
                <i class="form-icon" v-on:click="displayAuth = 'Key'"></i>Key
              </label>
              <label class="form-radio">
                <input type="radio" value="Password" v-model="displayAuth" />
                <i class="form-icon" v-on:click="displayAuth = 'Password'"></i>Password
              </label>
            </div>

            <div class="form-group">
              <label class="form-group">Username</label>
              <input class="form-input" type="text" v-model="edit.username" />
            </div>

            <div class="form-group">
              <label class="form-label">{{displayAuth}}</label>
              <textarea class="form-input" type="text" v-model="edit.privateKey" v-show="displayAuth === 'Key'"></textarea>
              <input class="form-input" type="password" v-model="edit.password" v-show="displayAuth === 'Password'" />
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="hideModal">Cancel</button>
        <button class="btn btn-md" v-on:click="saveCredentials">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { createEmitter, toast, refresh } from '../common'
import { Credential } from '../api'

export default Vue.extend({
  data() {
    return {
      modalActive: false,
      displayAuth: 'Key',
      cred: {} as Credential,
      edit: {} as Credential & { password: '' }
    }
  },
  mounted() {
    emitter.on(cred => {
      this.modalActive = true
      this.displayAuth = 'Key'
      this.cred = { ...cred, key: '' }
      this.edit = { ...cred, key: '', password: '' }
    })
  },
  methods: {
    async saveCredentials() {
      const orig = this.cred
      const body = {
        name: this.edit.name,
        username: this.edit.username,
        key: this.edit.password || this.edit.key
      }

      if (!body.key) {
        delete body.key
      }

      if (!body.username || body.username === orig.username) delete body.username
      if (!body.name || body.name === orig.name) delete body.name

      if (Object.keys(body).length === 0) {
        toast.warn(`Credentials not updated: No fields have changed`, 10000)
        return
      }

      const result = await fetch(`/api/credentials/${orig.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (result.status < 400) {
        this.modalActive = false
        toast.success('Successfully updated credentials')
        refresh.credentials()
        return
      }

      const msg = await result.json()
      toast.error(`Failed to update credentials: ${msg.message}`, 15000)
    },
    hideModal() {
      this.modalActive = false
    }
  }
})

const emitter = createEmitter<Credential>()
export function showModal(cred: Credential) {
  emitter.emit(cred)
}
</script>
