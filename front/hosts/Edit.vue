<template>
  <div class="modal" v-if="modalActive" v-bind:class="{ active: modalActive }">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Edit Host</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form>
            <div class="form-group">
              <label class="form-label">Hostname</label>
              <input class="form-input" type="text" v-model="edit.hostname" placeholder="127.0.0.1" />
            </div>

            <div class="form-group">
              <label class="form-label">Proxy IP</label>
              <input class="form-input" type="text" v-model="edit.proxyIp" placeholder="IP of the Docker Host for reverse proxy purposes" />
            </div>

            <div class="form-group">
              <label class="form-label">Vanity Hostname</label>
              <input class="form-input" type="text" v-model="edit.vanityHostname" placeholder="127.0.0.1 (Optional)" />
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
              <input class="form-input" type="text" v-model="edit.sshUsername" />
            </div>

            <div class="form-group">
              <label class="form-label">{{displayAuth}}</label>
              <textarea class="form-input" type="text" v-model="edit.privateKey" v-show="displayAuth === 'Key'"></textarea>
              <input class="form-input" type="password" v-model="edit.password" v-show="displayAuth === 'Password'" />
            </div>

            <div class="form-group">
              <label class="form-label">Container Capacity</label>
              <input class="form-input" type="text" v-model="edit.capacity" placeholder="5" />
            </div>

            <div class="form-group">
              <label class="form-label">SSH Port</label>
              <input class="form-input" type="text" v-model="edit.sshPort" placeholder="22" />
            </div>

            <div class="form-group">
              <label class="form-label">Docker Port</label>
              <input class="form-input" type="text" v-model="edit.dockerPort" placeholder="2375" />
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="hideModal">Cancel</button>
        <button class="btn btn-md" v-on:click="saveHost">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Host } from '../api'
import { createEmitter, refresh, toast } from '../common'

export default Vue.extend({
  data() {
    return {
      modalActive: false,
      displayAuth: 'Key' as 'Key' | 'Password',
      edit: {} as Host & { password: string },
      host: {} as Host
    }
  },
  mounted() {
    emitter.on(host => {
      this.modalActive = true
      this.displayAuth = 'Key'
      this.edit = { ...host, password: '', privateKey: '' }
      this.host = host
      console.log(this.edit)
    })
  },
  methods: {
    async saveHost() {
      const edit = this.edit
      const host = this.host
      const body = {
        hostname: edit.hostname,
        proxyIp: edit.proxyIp,
        vanityHostname: edit.vanityHostname,
        sshUsername: edit.sshUsername,
        sshPort: Number(edit.sshPort) || 0,
        capacity: Number(edit.capacity) || 5,
        key: edit.privateKey || edit.password,
        dockerPort: Number(edit.dockerPort) || 2375
      }

      for (const key of Object.keys(body) as Array<keyof typeof body>) {
        if (key === 'key') {
          if (!body.key) {
            delete body.key
          }
          continue
        }

        // If the original is empty and the "modified" is empty, the empty field isn't being modified
        // Therefore do not send the value (empty string) in the request body
        if (!body[key] && host[key]) {
          delete body[key]
        }
      }

      const result = await fetch(`/api/hosts/${host.id}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (result.status < 400) {
        this.modalActive = false
        toast.success('Successfully updated host')
        refresh.hosts()
        return
      }

      const msg = await result.json()
      toast.error(`Failed to update host: ${msg.message}`)
    },
    hideModal() {
      this.modalActive = false
    }
  }
})

const emitter = createEmitter<Host>()
export function showModal(host: Host) {
  emitter.emit(host)
}
</script>
