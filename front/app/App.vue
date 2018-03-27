<script lang="ts">
import Vue from 'vue'
import ContentArea from './ContentArea.vue'
import { AppState, getAll } from './api'

export default Vue.extend({
  components: { ContentArea },
  data() {
    const state: AppState = {
      containers: [],
      images: [],
      hosts: [],
      credentials: [],
      applications: [],
      remotes: [],
      config: {
        name: '',
        conciergePort: 0,
        proxyHostname: '',
        debug: 0,
        statsBinSize: 0,
        statsRetentionDays: 0,
        dockerRegistry: '',
        registryCredentials: 0
      }
    }
    return { state }
  },
  async mounted() {
    const newState = await getAll(this.state)
    this.state = newState
  }
})
</script>

<template>
  <div>
    <ContentArea v-bind:state="state" />
  </div>
</template>

<style>
header {
  border-bottom: 2px solid #b2b8e5;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  padding-top: 5px;
}

body {
  position: absolute;
  top: 0px;
  bottom: 20px;
  width: 100%;
}

.modal-container {
  min-width: 40vw;
}
</style>