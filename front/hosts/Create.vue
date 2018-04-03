<template>
  <div v-if="modalActive" v-bind:class="{ active: modalActive }" class="modal">
    <div class="modal-overlay" v-on:click="hideModal"></div>
    <div class="modal-container">
      <div class="modal-header">
        <button class="btn btn-clear float-right" v-on:click="hideModal"></button>
        <div class="modal-title">Create Host</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form>
            <div class="form-group">
              <label class="form-label">Hostname
                <sub>(Optional) Will use the local unix socket if not provided</sub>
              </label>
              <input class="form-input" type="text" v-model="hostname" placeholder="127.0.0.1" />
            </div>

            <div class="form-group">
              <label class="form-label">Proxy IP</label>
              <input class="form-input" type="text" v-model="proxyIp" placeholder="IP of the Docker Host for reverse proxy purposes" />
            </div>

            <div class="form-group">
              <label class="form-label">Vanity Hostname</label>
              <input class="form-input" type="text" v-model="vanityHostname" placeholder="127.0.0.1 (Optional)" />
            </div>

            <div class="form-group">
              <label class="form-label">SSH Authorisation Style</label>
              <label class="form-radio">
                <input type="radio" value="Key" v-model="displayAuth" />
                <i class="form-icon" v-on:click="displayAuth = 'Key'"></i>Key
              </label>
              <label class="form-radio">
                <input type="radio" value="Password" v-model="displayAuth" />
                <i class="form-icon" v-on:click="displayPath = 'Password'"></i>Password
              </label>
            </div>

            <div class="form-group">
              <label class="form-group">Username</label>
              <input class="form-input" v-model="username" type="text" />
            </div>

            <div class="form-group">
              <label class="form-label">{{displayAuth}}</label>
              <textarea class="form-input" type="text" v-model="privateKey" v-show="isKey"></textarea>
              <input class="form-input" type="password" v-model="password" v-show="isPassword" />
            </div>

            <div class="form-group">
              <label class="form-label">Container Capacity</label>
              <input class="form-input" type="text" v-model="capacity" placeholder="5" />
            </div>

            <div class="form-group">
              <label class="form-label">SSH Port</label>
              <input class="form-input" type="text" v-model="sshPort" placeholder="22" />
            </div>

            <div class="form-group">
              <label class="form-label">Docker Port</label>
              <input class="form-input" type="text" v-model="dockerPort" placeholder="2375" />
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-md" v-on:click="createHost">Save</button>
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
      hostname: '',
      proxyIp: '',
      vanityHostname: '',
      capacity: '5',
      privateKey: '',
      password: '',
      username: '',
      sshPort: '22',
      dockerPort: '2375',
      displayAuth: 'Password' as 'Key' | 'Password'
    }
  },
  mounted() {
    emitter.on(() => {
      this.modalActive = true
      this.hostname = ''
      this.vanityHostname = ''
      this.proxyIp = ''
      this.capacity = '5'
      this.privateKey = ''
      this.password = ''
      this.username = ''
      this.sshPort = '22'
      this.dockerPort = '2375'
      this.displayAuth = 'Key'
    })
  },
  methods: {
    async createHost() {
      const body = {
        hostname: this.hostname,
        proxyIp: this.proxyIp,
        vanityHostname: this.vanityHostname || this.hostname,
        capacity: Number(this.capacity) || 5,
        dockerPort: Number(this.dockerPort) || 2375,
        sshUsername: this.username,
        sshPort: Number(this.sshPort) || 22,
        key: this.displayAuth === 'Key' ? this.privateKey : this.password
      }

      const res = await fetch('/api/hosts', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      })

      if (res.status === 200) {
        this.modalActive = false
        refresh.hosts()
        toast.success('Successfully created host')
        return
      }

      const msg = await res.json()
      toast.error(`Failed to create host: ${msg.message}`, 15000)
    },
    hideModal() {
      this.modalActive = false
    }
  },
  computed: {
    isKey: function(): boolean {
      return this.displayAuth === 'Key'
    },
    isPassword: function(): boolean {
      return this.displayAuth === 'Password'
    }
  }
})

const emitter = createEmitter<undefined>()
export function showModal() {
  emitter.emit(undefined)
}
</script>

