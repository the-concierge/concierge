
<template>
  <Modal v-model="modalActive" v-bind:onHide="hideModal">
    <template slot="header">Edit Host</template>

    <form>
      <InputText v-model="edit.hostname" :placeholder="'127.0.0.1'">Hostname</InputText>

      <InputText
        v-model="edit.proxyIp"
        placeholder="'IP of the Docker Host for reverse proxy purposes'"
      >Proxy IP</InputText>

      <InputText v-model="edit.vanityHostname" :placeholder="'Optional'">Vanity Hostname</InputText>

      <InputText v-model="edit.capacity" :placeholder="5">Container Capacity</InputText>

      <InputText v-model="edit.sshPort" :placeholder="22">SSH Port</InputText>

      <InputText v-model="edit.dockerPort" :placeholder="2375">Docker Port</InputText>

      <SelectList v-if="creds.length > 1" v-model="credentialsId" :options="creds">Credentials</SelectList>
    </form>

    <template slot="footer">
      <button class="btn btn-md" v-on:click="hideModal">Cancel</button>
      <button class="btn btn-md" v-on:click="saveHost">Save</button>
    </template>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Host, Credential } from '../api'
import { createEmitter, refresh, toast } from '../common'
import { InputSwitch, InputText, SelectList, Modal } from '../elements'

type ComputedCredential = Credential & { label: string }

export default Vue.extend({
  components: {
    InputSwitch,
    InputText,
    Modal,
    SelectList
  },
  props: {
    credentials: { type: Array as () => ComputedCredential[] }
  },
  data() {
    return {
      modalActive: false,
      edit: {} as Host,
      host: {} as Host,
      credentialsId: -1,
      creds: [] as ComputedCredential[]
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
  mounted() {
    emitter.on(host => {
      this.modalActive = true
      this.edit = { ...host }
      this.host = host

      if (Number(host.credentialsId) > 0) {
        const cred = this.credentials.find(cred => cred.id === host.credentialsId)
        if (cred) {
          this.credentialsId = cred.id
        }
      }
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
        sshPort: Number(edit.sshPort) || 0,
        capacity: Number(edit.capacity) || 5,
        dockerPort: Number(edit.dockerPort) || 2375,
        credentialsId: this.credentialsId
      }

      for (const key of Object.keys(body) as Array<keyof typeof body>) {
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
