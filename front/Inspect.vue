<template>
  <div>
    <SafeLink url="/containers">&lt; Back to Containers</SafeLink>
    <div v-if="canRender">
      <h4>
        Details: {{ container.name }}
        <span style="float: right">
          <button class="btn btn-md" v-on:click="stopContainer" v-if="showStopButton" :disabled="waiting">Stop</button>
          <button class="btn btn-md" v-on:click="startContainer" v-if="showStartButton" :disabled="waiting">Start</button>
          <button class="btn btn-md" v-on:click="removeContainer" :disabled="waiting">Remove</button>
        </span>
      </h4>
      <Details v-bind:container="container" v-bind:config="config" />

      <div class="divider"></div>

      <h4>
        Performance Statistics
        <span style="float: right">
          <button class="btn btn-md" v-on:click="refreshStats" :disabled="waiting">Refresh Charts</button>
        </span>
      </h4>
      <Stats v-bind:container="container" />

      <div class="divider"></div>

      <h4>Logs</h4>
      <Logs v-bind:container="container" />
    </div>
  </div>

</template>

<script lang="ts">
import Vue from 'vue'
import SafeLink from './SafeLink.vue'
import Details from './inspect/Details.vue'
import Stats, { refreshStats } from './inspect/Stats.vue'
import Logs from './inspect/Logs.vue'
import { Container, Configuration } from './api'
import { toast } from './common'

export default Vue.extend({
  components: { SafeLink, Details, Stats, Logs },
  props: {
    container: { type: Object as () => Container },
    config: { type: Object as () => Configuration }
  },
  data() {
    return {
      waiting: false
    }
  },
  computed: {
    canRender(): boolean {
      return this.container !== undefined
    },
    showStartButton(): boolean {
      return this.container.State === 'exited'
    },
    showStopButton(): boolean {
      return this.container.State === 'running'
    }
  },
  methods: {
    async request(cmd: string, method: string = 'GET') {
      const container = this.container
      const route = `/api/containers/${container.Id}/${cmd}/${container.concierge.hostId}`
      const res = await fetch(route, { method })
      const result = await res.json()
      if (res.status >= 400) {
        toast.error(`Request failed: ${result.message}`)
      }
      return result
    },
    stopContainer() {
      this.request('stop')
    },
    startContainer() {
      this.request('start')
    },
    async removeContainer() {
      await this.request('host', 'DELETE')
      this.waiting = true
    },
    refreshStats() {
      refreshStats()
    }
  }
})
</script>
