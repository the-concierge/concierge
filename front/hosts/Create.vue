<template>
  <Modal v-model="modalActive" :onHide="hideModal">
    <template slot="header">Create Host</template>

    <form>
      <InputText v-model="hostname" :placeholder="'127.0.0.1'">
        Hostname
        <sub>(Optional) Will use the local unix socket if not provided</sub>
      </InputText>

      <InputText
        v-model="proxyIp"
        :placeholder="'IP of the Docker Host for reverse proxy purposes'"
      >Proxy IP</InputText>

      <InputText v-model="vanityHostname" :placeholder="'127.0.0.1 (Optional)'">Vanity Hostname</InputText>

      <InputText v-model="capacity" :placeholder="5">Container Capacity</InputText>

      <InputText v-model="sshPort" :placeholder="22">SSH Port</InputText>

      <InputText v-model="dockerPort" :placeholder="2375">Docker Port</InputText>

      <SelectList v-model="credentialsId" :options="creds">Credentials</SelectList>
    </form>

    <template slot="footer">
      <button class="btn btn-md" v-on:click="createHost">Save</button>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { toast, refresh, createEmitter } from '../common'
import { InputSwitch, InputText, Modal, SelectList } from '../elements'
import { Credential } from '../api'

type ComputedCredential = Credential & { label: string }

export default Vue.extend({
  components: { InputSwitch, InputText, Modal, SelectList },
  props: {
    credentials: { type: Array as () => Credential[] }
  },
  data() {
    return {
      modalActive: false,
      hostname: '',
      proxyIp: '',
      vanityHostname: '',
      capacity: '5',
      sshPort: '22',
      dockerPort: '2375',
      credentialsId: -1,
      creds: [] as ComputedCredential[]
    }
  },
  mounted() {
    emitter.on(() => {
      this.modalActive = true
      this.hostname = ''
      this.vanityHostname = ''
      this.proxyIp = ''
      this.capacity = '5'
      this.sshPort = '22'
      this.dockerPort = '2375'
    })
  },
  watch: {
    credentials: function() {
      this.creds = [
        { id: -1, name: 'None', label: 'None', username: '', key: '' },
        ...this.credentials.map(cred => ({ ...cred, label: cred.name }))
      ]
    }
  },
  methods: {
    async createHost() {
      const body = {
        hostname: this.hostname,
        proxyIp: this.proxyIp,
        vanityHostname: this.vanityHostname || this.hostname,
        capacity: Number(this.capacity) || 5,
        dockerPort: Number(this.dockerPort) || 2375,
        sshPort: Number(this.sshPort) || 22,
        credentialsId: Number(this.credentialsId)
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
  }
})

const emitter = createEmitter<undefined>()
export function showModal() {
  emitter.emit(undefined)
}
</script>

