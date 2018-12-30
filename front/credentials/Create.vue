<template>
  <div class="modal" v-if="modalActive" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Create Credentials</div>
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
                Username
                <cite>Optional: This can be provided in the Git repository</cite>
              </label>
              <input class="form-input" type="text" v-model="username" placeholder="Optional">
            </div>

            <b>Use either Password or Key -- Provide a password if you are using HTTP/HTTPS over SSH</b>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input class="form-input" type="password" v-model="password">
            </div>

            <div class="form-group">
              <label class="form-label">Key</label>
              <textarea class="form-input" type="password" v-model="key"></textarea>
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="createCredentials">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { toast, refresh, createEmitter } from '../common'

export default Vue.extend({
  data() {
    return {
      modalActive: false,
      name: '',
      username: '',
      password: '',
      key: ''
    }
  },
  mounted() {
    emitter.on(() => {
      this.modalActive = true
      this.name = ''
      this.username = ''
      this.password = ''
      this.key = ''
    })
  },
  methods: {
    async createCredentials() {
      const body = {
        name: this.name,
        username: this.username,
        key: this.password || this.key || ''
      }

      const result = await fetch(`/api/credentials`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (result.status === 200) {
        refresh.credentials()
        toast.success('Successfully created credentials')
        this.hideModal()
        return
      }
      const error = await result.json()
      toast.error(`Failed to create credentials: ${error.message}`)
    },
    hideModal() {
      this.modalActive = false
    }
  }
})

const emitter = createEmitter<null>()
export function showModal() {
  emitter.emit(null)
}
</script>
